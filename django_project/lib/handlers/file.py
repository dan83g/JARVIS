import os
from abc import abstractmethod
from dataclasses import dataclass
from contextlib import contextmanager
from sqlite3 import connect
from sqlite3.dbapi2 import Connection
from pandas import DataFrame, ExcelFile, read_csv
from pandas.io.sql import read_sql
import sql_metadata as sql
from typing import Generator
from .abstract import HandlerAbstractFactory
from .exceptions import HandlerConnectionError, HandlerExecutionError


@dataclass
class FileHandler(HandlerAbstractFactory):
    timeout: int = 30
    prepared_query: str = ''
    file_directory: str = ''
    filename: str = ''
    encoding: str = 'utf_8'
    separator: str = ';'
    columns_exists: bool = False
    data_frame: DataFrame | None = None

    @abstractmethod
    def __post_init__(self) -> None:
        pass

    @property
    @contextmanager
    def _sqlite_connection(self) -> Generator[Connection, None, None]:
        _connection = connect(':memory:')
        try:
            yield _connection
        finally:
            _connection.close()

    @property
    def _get_tablename(self) -> str:
        tables = sql.Parser(self.prepared_query).tables
        if not tables:
            raise HandlerExecutionError(message='Ошибка выполнения. Невозможно выделить имя таблицы из запроса')
        return str(tables[0])

    def _sqlite_execute(self, table_name: str, query: str) -> list[dict]:
        """Execute the SQL query
        """
        if self.data_frame is None or self.data_frame.empty:
            raise HandlerExecutionError(message=f'Ошибка при обработке файла {self.filename}: DataFrame не определен')

        with self._sqlite_connection as cnxn:
            # self.data_frame.reset_index(drop=True, inplace=True)
            self.data_frame.to_sql(name=table_name, con=cnxn, index=not any(name is None for name in self.data_frame.index.names))
            try:
                df = read_sql(query, cnxn)
                df.columns = [f'undefined_{index}' if name == '' else name for index, name in enumerate(df.columns)]
                return list(df.T.to_dict().values())
            except Exception as error:
                raise HandlerExecutionError(message=f'Ошибка при обрабоотке файла {self.filename}. Ошибка выполнения запроса: {error}') from error

    def ping(self) -> bool:
        """Test existence of file or file directory

        :return: If file exists
        :rtype: bool
        """
        return True


@dataclass
class ExcelFileHandler(FileHandler):

    def __post_init__(self) -> None:
        # super().__post_init__()
        if not (os.path.exists(self.filename) and os.path.isfile(self.filename)):
            raise HandlerConnectionError(message=f'File {self.filename} not found')
        try:
            self._excel_handler = ExcelFile(self.filename)
        except Exception as error:
            raise HandlerConnectionError(message=f'Ошибка подключения к файлу {self.filename}, {error}') from error

    def execute(self) -> list[dict]:
        try:
            tablename = self._get_tablename
            self.data_frame = self._excel_handler.parse(tablename.strip("[]"))
            return self._sqlite_execute(table_name="data_frame", query=self.prepared_query.replace(tablename, 'data_frame'))
        except Exception as error:
            raise HandlerExecutionError(message=f'Ошибка подключения к Exel-файлу {self.filename}') from error


@dataclass
class CSVFileHandler(FileHandler):

    def __post_init__(self) -> None:
        if not (os.path.exists(self.file_directory) and os.path.isdir(self.file_directory)):
            raise HandlerConnectionError(message=f'Directory {self.file_directory} not found')

    def execute(self) -> list[dict]:
        tablename = self._get_tablename
        filename = os.path.join(self.file_directory, tablename)
        if not (os.path.exists(filename) and os.path.isfile(filename)):
            raise HandlerConnectionError(message=f'Filename {filename} not found')
        try:
            self.data_frame = read_csv(filename, sep=self.separator, encoding=self.encoding, skip_blank_lines=not self.columns_exists)
            return self._sqlite_execute(table_name="data_frame", query=self.prepared_query.replace(tablename, 'data_frame'))
        except Exception as error:
            raise HandlerExecutionError(message=f'Ошибка выполнения запроса из файла {filename}') from error
