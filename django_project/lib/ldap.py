from ldap3 import Server, Connection, ALL
from dataclasses import dataclass
from contextlib import contextmanager
from enum import Enum
import re
from django.contrib.auth.models import User
from typing import Generator, TypedDict


class LDAPError(Exception):
    pass


class LDAPConnectionError(LDAPError):
    def __init__(self):
        super().__init__("LDAP Server Connection Error")


class LDAPSearchError(LDAPError):
    def __init__(self):
        super().__init__("LDAP Search Error")


class LDAPNoDataAvailableError(LDAPError):
    def __init__(self):
        super().__init__("LDAP No Data Available")


class UserDict(TypedDict):
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
    rdn: str
    search_dn: str
    user_guid_param: str
    query: str

    @contextmanager
    def _connection(self) -> Generator[Connection, None, None]:
        connection = None
        try:
            if self.protocol == LDAPProtocolType.LDAPS:
                ldap_server = Server(self.host, port=self.port, connect_timeout=self.connect_timeout, get_info=ALL, use_ssl=True)
            else:
                ldap_server = Server(self.host, port=self.port, connect_timeout=self.connect_timeout, get_info=ALL)
            connection = Connection(server=ldap_server, user=self.user_dn, password=self.password, auto_bind='DEFAULT')
            yield connection
        except Exception as error:
            raise LDAPConnectionError from error
        finally:
            if connection:
                connection.unbind()

    def test_connection(self) -> bool:
        """test connection to LDAP server

        :return: True if OK
        :rtype: bool
        :raises: LDAPConnectionError
        """
        with self._connection():
            return True

    def get_user_groups(self, user: User) -> list[str]:
        with self._connection() as connection:
            try:
                # todo: user param
                connection.search(self.search_dn, f'(&({self.user_guid_param}={user.guid}))', attributes=['memberOf'])
            except Exception as error:
                raise LDAPSearchError from error
            if not connection.entries:
                raise LDAPNoDataAvailableError
            return [re.split('[=,]', group)[1] for group in connection.entries[0].memberOf.values]

    def get_users(self, user: User) -> list[UserDict]:
        """get list of UserDict
        """
        with self._connection() as connection:
            try:
                connection.search(self.search_dn, self.query.format(username=user.username if user else '*'), attributes=['*', 'mail', 'memberOf'])
            except Exception as error:
                raise LDAPSearchError from error

            if not connection.entries:
                raise LDAPNoDataAvailableError

            return [
                UserDict(
                    guid=getattr(entry, self.user_guid_param).value,
                    username=getattr(entry, self.rdn).value,
                    last_name=entry.sn.value if 'sn' in entry else '',
                    first_name=entry.givenName.value if 'givenName' in entry else '',
                    email=entry.mail.value if 'mail' in entry else '',
                    groups=[re.split('[=,]', group)[1] for group in entry.memberOf.values]
                ) for entry in connection.entries
            ]
