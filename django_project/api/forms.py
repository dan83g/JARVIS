from pydantic import BaseModel
from typing import List
# validator


class ApiSrc(BaseModel):
    source: str
    source_type: str


class ApiQuery(BaseModel):
    name: str
    datatype: str
    timeout: int
    typename: str
    regexp: str
    sources: List[ApiSrc]


class ApiQueryList(BaseModel):
    __root__: List[ApiQuery]

    def dict(self, *args, **kwargs):
        data = super().dict(*args, **kwargs)
        return data['__root__'] if self.__custom_root_type__ else data


class ApiSearchModel(BaseModel):
    typename: str
    queryname: str
    value: str

    # @validator('value')
    # def try_decode_base64(cls, v, values, **kwargs):
    #     if values.get('base64') != 1:
    #         return v
    #     try:
    #         return base64.b64decode(v).decode('UTF-16')
    #     except Exception:
    #         ValueError("Ошибка декодирования base64, корректно ли выставлен параметр base64")
