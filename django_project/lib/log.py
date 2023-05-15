import os
import logging
import threading
from datetime import datetime
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from kafka import KafkaProducer
import json
from lib.encoders import JsonEncoder
from lib.enum import FactoryEnum
from typing import Union, List

logger = logging.getLogger(__name__)


class LoggingException(Exception):
    pass


@dataclass
class LogAbstractFactory(ABC):
    """Abstract Factory Class for logging user queries
    """
    username: str
    typename: str
    values: List[str] = field(default_factory=list)

    @abstractmethod
    def prepare_logging_data(self) -> Union[str, dict]:
        pass

    @abstractmethod
    def execute(self, logging_data: Union[dict, str, None] = None) -> None:
        pass


@dataclass(kw_only=True)
class FileFactory(LogAbstractFactory):
    logging_dir: str
    filename: str = f"query_log_{datetime.now().strftime(r'%Y%m%d')}.log"

    def prepare_logging_data(self) -> str:
        return f'{datetime.now():%Y.%m.%d %H:%M:%S} {self.username} {self.typename} {", ".join(self.values)}\n'

    def execute(self, logging_data: str) -> None:
        """file logging handler

        :param logging_data: line string for logging, defaults to ''
        :type logging_data: str, optional
        """

        if not self.logging_dir:
            logger.error('Logging Error: Logging directory is not defined')
            return

        # create directory in needed
        try:
            if not os.path.exists(self.logging_dir):
                os.makedirs(self.logging_dir, exist_ok=True)
        except OSError as error:
            logger.error(f'Logging Error: Can not create logging directory {self.logging_dir}: {error}')

        # append line to log file
        logging_full_filename = os.path.join(self.logging_dir, self.filename)
        try:
            with open(logging_full_filename, 'a' if os.path.exists(logging_full_filename) else 'w', encoding='utf-8') as file:
                file.write(logging_data)
        except OSError as error:
            logger.error(f'Logging Error: Can not write to file {logging_full_filename}: {error}')


@dataclass(kw_only=True)
class KafkaFactory(LogAbstractFactory):
    host: str
    port: int
    topic: str

    def prepare_logging_data(self) -> dict:
        return {
            "datetime": datetime.now(),
            "username": self.username,
            "type": self.typename,
            "values": self.values,
        }

    def _get_producer(self, server_list: List[str]) -> KafkaProducer:
        """init KafkaProducer for send logging data

        :param server_list: example ['localhost:8989','1.0.0.1:8080']
        :type server_list: List[str]
        :return: KafkaProducer
        :rtype: KafkaProducer
        """
        try:
            return KafkaProducer(
                bootstrap_servers=server_list,
                value_serializer=lambda m: json.dumps(m, cls=JsonEncoder, ensure_ascii=False).encode('utf-8'),
                acks=0,
                retries=0,
                retry_backoff_ms=0,
                api_version_auto_timeout_ms=1000,
                # api_version=(2, 5, 0)
                # linger_ms=10,
            )
        except Exception as error:
            raise LoggingException(f"Can't create KafkaProducer instance: {error}")

    def _send_data(self, producer: KafkaProducer, topic: str, data_dict: dict) -> None:
        """send data to kafka
        """
        try:
            producer.send(topic, data_dict)
            producer.flush(timeout=1.0)
            producer.close()
        except Exception as error:
            logger.error(f'Logging Error: Can not send data to Kafka: {error}')

    def execute(self, logging_data: dict) -> None:
        """kafka logging handler

        :param logging_data: dict data for logging, defaults to {}
        :type logging_data: dict, optional
        """
        try:
            producer = self._get_producer([f"{self.host}:{self.port}"])
            self._send_data(producer=producer, topic=self.topic, data_dict=logging_data)
        except Exception as error:
            logger.error(f"Logging error: Can not send log data to Kafka: {error}")


class LoggingHandlers(FactoryEnum):
    """storing logging handlers types
    """
    NO = None
    FILE = FileFactory
    KAFKA = KafkaFactory

    def __init__(self, factory: LogAbstractFactory) -> None:
        self.factory = factory


class Log:
    """logging queries
    """
    def __init__(self, handlers: List[LoggingHandlers] = [LoggingHandlers.FILE], username: str = 'unknown', typename: str = 'unknown', values: List[str] = []) -> None:
        """init logging queries

        :param handlers: one ot several handlers, defaults to [LoggingHandlers.FILE]
        :type handlers: list, optional
        :param username: username, defaults to 'unknown'
        :type username: str, optional
        :param typename: typename, defaults to 'unknown'
        :type typename: str, optional
        :param values: values in query, defaults to []
        :type values: list, optional
        """
        # set only permitted handlers
        self.handlers = handlers
        self.username = username
        self.typename = typename
        self.values = values

    def create_factory(self, logging_handler: LoggingHandlers) -> LogAbstractFactory:
        return logging_handler.factory(self.username, self.typename, self.values)  # type: ignore

    def log(self):
        """run log data
        """
        for handler in self.handlers:
            factory = self.create_factory(logging_handler=handler)
            logging_data = factory.prepare_logging_data()
            thread = threading.Thread(target=factory.execute, args=(logging_data,))
            thread.start()
