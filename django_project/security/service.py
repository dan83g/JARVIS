from django.contrib.auth.models import Group
from .models import User, ldap
from lib.ldap import LDAP, LDAPUserDict
from typing import Mapping


class UserUpdaterException(Exception):
    pass


class NoLdapSettingsAvailableException(UserUpdaterException):
    def __init__(self):
        super().__init__("No LDAP Settings Available")


class UserUpdateter:

    def _get_ldap_instance(self):
        ldap_server = ldap.objects.filter(active=True).first()
        if not ldap_server:
            raise NoLdapSettingsAvailableException()
        return LDAP.init_from_dict(ldap_server.as_dict())

    def update_user_groups(self, user: User, groups: list[str]) -> None:
        """Update user membership in groups

        :param user: User class
        :type user: User
        """
        # retrieve current user groups
        current_groups = {}
        for group in user.groups.all():
            current_groups[group.name] = group

        # enumerate new groups
        for group_name in groups:
            if group_name in set(current_groups.keys()):
                del current_groups[group_name]
            else:
                # if group not present, then add user to group
                entering_group, _ = Group.objects.get_or_create(name=group_name)
                user.groups.add(entering_group)

        # exclude user from other groups
        for group in current_groups.values():
            user.groups.remove(group.id)

    def _update_user(self, user: User, ldap_user: LDAPUserDict) -> None:
        """Update User object

        :param user: Django User object
        :type user: User
        :param ldap_user: LDAP User Data
        :type ldap_user: LDAPUserDict
        """
        # update guid if it is None
        user.guid = user.guid or ldap_user.get('guid')
        user.username = ldap_user.get('username') or user.username
        user.email = ldap_user.get('email') or user.email
        user.last_name = ldap_user.get('last_name') or user.last_name
        user.first_name = ldap_user.get('first_name') or user.first_name
        self.update_user_groups(user, ldap_user.get('groups'))
        if not user.password:
            user.set_unusable_password()
        user.save()

    def update_current_user_by_guid(self, user: User) -> None:
        if not user.guid:
            return
        self._update_user(
            user=user,
            ldap_user=self._get_ldap_instance().get_user_by_guid(user.guid)
        )

    def update_current_user_by_rdn(self, user: User) -> None:
        if not user.username:
            return
        self._update_user(
            user=user,
            ldap_user=self._get_ldap_instance().get_user_by_rdn(user.username)
        )

    def _lookup_user(self, mapping: Mapping[str, LDAPUserDict], guid: str) -> LDAPUserDict | None:
        return mapping.get("guid")

    def update_all_existing_users(self) -> None:
        """update all users properties
        """
        # get ldap user Mapping
        ldap_user_mapping = self._get_ldap_instance().get_all_users()
        # get user list
        users = User.objects.all()
        # update users
        for user in users:
            if not user.guid:
                continue
            if not (ldap_user := self._lookup_user(ldap_user_mapping, user.guid)):
                continue
            self._update_user(user=user, ldap_user=ldap_user)
