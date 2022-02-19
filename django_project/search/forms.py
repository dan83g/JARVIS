from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from dateutil import parser
from typing import Optional
import base64
from pydantic import (
    BaseModel, validator
)


class SearchModel(BaseModel):
    base64: Optional[int] = None
    value: str
    date_from: datetime = None
    date_to: datetime = None

    @validator('value')
    def try_decode_base64(cls, v, values, **kwargs):
        if values.get('base64') != 1:
            return v
        try:
            return base64.b64decode(v).decode('UTF-16')
        except Exception:
            ValueError("Ошибка декодирования base64, корректно ли выставлен параметр base64")

    @validator('date_from', 'date_to', pre=True)
    def try_dates(cls, v, values, **kwargs):
        if not v and values.get('date_from'):
            return date.now() + relativedelta(days=1)
        if v and not values.get('date_from'):
            try:
                temp_date = parser.parse(v)
                values['date_from'] = datetime(1970, 1, 1)
                return temp_date
            except Exception:
                return
        return v or None
