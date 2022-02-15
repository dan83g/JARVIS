from pydantic import (
    BaseModel, validator
)


class AuthModel(BaseModel):
    username: str
    password: str

    @validator('username')
    def name_not_empty(cls, v):
        if v in ('', None):
            raise ValueError('Имя пользователя отсутствует')
        return v

    @validator('password')
    def pass_not_empty(cls, v):
        if v in ('', None):
            raise ValueError('Пароль отсутствует')
        return v
