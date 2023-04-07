import base64
from pydantic import (
    BaseModel, validator)
from typing import Optional


class MapUserDataModel(BaseModel):
    id: int | None = None
    layername: str | None = None
    data: dict | None = None


class MapGeoName(MapUserDataModel):
    geoname: str


class MapCoordinates(BaseModel):
    """PyDantic model for coordinates
    :param coordinates: string with coordinates (optional)
    :type coordinates: string
    :param id: id of list geo json coordinates (optional)
    :type id: string
    """
    id: Optional[str] = None
    coordinates: Optional[str] = None


class MapIndexModel(BaseModel):
    base64: Optional[int] = None
    geoname: str | None = None
    coordinates: str | None = None

    @validator('geoname', 'coordinates')
    def try_decode_base64(cls, v, values, **kwargs):
        if values.get('base64') != 1:
            return v
        try:
            return base64.b64decode(v).decode('UTF-16')
        except Exception:
            ValueError("Ошибка декодирования base64, корректно ли выставлен параметр base64")
