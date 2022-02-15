import base64
from typing import Optional
from pydantic import (
    BaseModel, validator)


class DtSearchModel(BaseModel):
    base64: Optional[int] = None
    query: str = ''
    indexes: str = ''
    searchtype: int = 1
    ext: str = ''
    no_toolbar: str = ''

    @validator('query')
    def try_decode_base64(cls, v, values, **kwargs):
        if values.get('base64') == 1:
            try:
                v = base64.b64decode(v).decode('UTF-16')
            except Exception:
                ValueError("Ошибка декодирования base64, корректно ли выставлен параметр base64")
                return
        return v.replace("'", "\"")

    @validator('indexes')
    def try_split_indexes(cls, v):
        return v.split(',')
