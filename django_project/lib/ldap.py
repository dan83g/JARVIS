import re
from enum import Enum
from ldap3 import Server, Connection, ALL
from dataclasses import dataclass, fields
from contextlib import contextmanager
from typing import Generator, TypedDict, Mapping


class LDAPError(Exception):
    pass


class LDAPConnectionError(LDAPError):
    def __init__(self):
        super().__init__("LDAP Server Connection Error")


class LDAPBindError(LDAPError):
    def __init__(self):
        super().__init__("LDAP Server Bind Error")


class LDAPSearchError(LDAPError):
    def __init__(self):
        super().__init__("LDAP Search Error")


class LDAPNoDataAvailableError(LDAPError):
    def __init__(self):
        super().__init__("LDAP No Data Available")


class LDAPUserDict(TypedDict):
    guid: str
    username: str
    last_name: str
    first_name: str
    email: str
    groups: list[str]


class LDAPProtocolType(str, Enum):
    LDAP = 'ldap'
    LDAPS = 'ldaps'


@dataclass(kw_only=True)
class LDAP:
    protocol: LDAPProtocolType = LDAPProtocolType.LDAP
    host: str
    port: int = 389
    connect_timeout: int = 5
    user_dn: str
    password: str
    search_dn: str
    rdn: str
    user_guid_param: str
    user_class: str

    @classmethod
    def init_from_dict(cls, initial_dict: dict):
        class_fields = {f.name for f in fields(cls)}
        return cls(**{key: value for key, value in initial_dict.items() if key in class_fields and value})

    @contextmanager
    def _connection(self) -> Generator[Connection, None, None]:
        """LDAP connection contextmanager

        :raises LDAPConnectionError: if connection is not established
        :yield: LDAP connection object
        :rtype: Generator[Connection, None, None]
        """
        connection = None
        try:
            if self.protocol == LDAPProtocolType.LDAPS:
                ldap_server = Server(self.host, port=self.port, connect_timeout=self.connect_timeout, get_info=ALL, use_ssl=True)
            else:
                ldap_server = Server(self.host, port=self.port, connect_timeout=self.connect_timeout, get_info=ALL)
            connection = Connection(server=ldap_server, user=self.user_dn, password=self.password)
            if not connection.bind():
                raise LDAPBindError
            yield connection
        except Exception as error:
            raise LDAPConnectionError from error
        finally:
            if connection:
                connection.unbind()

    def test_connection(self) -> bool:
        """Test connection to LDAP server

        :return: True if OK
        :rtype: bool
        :raises: LDAPConnectionError
        """
        with self._connection():
            return True

    def get_user_by_guid(self, guid: str) -> LDAPUserDict:
        """get user data from LDAP by guid

        :param guid: LDAP user quid
        :type guid: str
        :raises LDAPSearchError: if search Error
        :raises LDAPNoDataAvailableError: if User data is not available
        :return: LDAP User data
        :rtype: LDAPUserDict
        """
        with self._connection() as connection:
            try:
                connection.search(self.search_dn, f'(&(objectClass={self.user_class})({self.user_guid_param}={guid}))', attributes=['*', 'mail', 'memberOf'])
            except Exception as error:
                raise LDAPSearchError from error
            if not connection.entries:
                raise LDAPNoDataAvailableError
            entry = connection.entries[0]
            return LDAPUserDict(
                guid=getattr(entry, self.user_guid_param).value,
                username=getattr(entry, self.rdn).value,
                last_name=entry.sn.value if 'sn' in entry else '',
                first_name=entry.givenName.value if 'givenName' in entry else '',
                email=entry.mail.value if 'mail' in entry else '',
                groups=[re.split('[=,]', group)[1] for group in entry.memberOf.values]
            )

    def get_user_by_rdn(self, username: str) -> LDAPUserDict:
        """get user data from LDAP by rdn

        :param username: LDAP username
        :type username: str
        :raises LDAPSearchError: if search Error
        :raises LDAPNoDataAvailableError: if User data is not available
        :return: LDAP User data
        :rtype: LDAPUserDict
        """
        with self._connection() as connection:
            try:
                connection.search(self.search_dn, f'(&(objectClass={self.user_class})({self.rdn}={username}))', attributes=['*', 'mail', 'memberOf'])
            except Exception as error:
                raise LDAPSearchError from error
            if not connection.entries:
                raise LDAPNoDataAvailableError
            entry = connection.entries[0]
            return LDAPUserDict(
                guid=getattr(entry, self.user_guid_param).value,
                username=getattr(entry, self.rdn).value,
                last_name=entry.sn.value if 'sn' in entry else '',
                first_name=entry.givenName.value if 'givenName' in entry else '',
                email=entry.mail.value if 'mail' in entry else '',
                groups=[re.split('[=,]', group)[1] for group in entry.memberOf.values]
            )

    def get_all_users(self) -> Mapping[str, LDAPUserDict]:
        """get list of UserDict
        """
        with self._connection() as connection:
            try:
                connection.search(self.search_dn, f'(&(objectClass={self.user_class})({self.rdn}=*))', attributes=['*', 'mail', 'memberOf'])
            except Exception as error:
                raise LDAPSearchError from error

            if not connection.entries:
                raise LDAPNoDataAvailableError

            return {
                getattr(entry, self.user_guid_param).value: LDAPUserDict(
                    guid=getattr(entry, self.user_guid_param).value,
                    username=getattr(entry, self.rdn).value,
                    last_name=entry.sn.value if 'sn' in entry else '',
                    first_name=entry.givenName.value if 'givenName' in entry else '',
                    email=entry.mail.value if 'mail' in entry else '',
                    groups=[re.split('[=,]', group)[1] for group in entry.memberOf.values]
                ) for entry in connection.entries
            }
