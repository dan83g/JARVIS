from ninja import ModelSchema, Schema
from django.contrib.auth.models import User, Group


class GroupSchema(ModelSchema):
    class Config:
        model = Group
        model_fields = ['id', 'name']


class UserSchema(ModelSchema):
    groups: list[GroupSchema] = []

    class Config:
        model = User
        model_fields = ['id', 'username', 'email', 'first_name', 'last_name', 'last_login']


class AuthSchema(Schema):
    username: str
    password: str
