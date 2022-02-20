import base64
from pydantic import (
    BaseModel, validator)
from typing import Optional


class MapUserDataModel(BaseModel):
    id: int = None
    layername: str = None
    data: dict = None


class MapGeoName(MapUserDataModel):
    geoname: str


class MapCoordinates(BaseModel):
    """PyDantic model for coordinates
    :param coordinates: string with coordinates (optional)
    :type coordinates: string
    :param hash: hash of list geo json coordinates (optional)
    :type hash: string
    """
    coordinates: Optional[str] = None
    coordinates_hash: Optional[str] = None


class MapIndexModel(BaseModel):
    base64: Optional[int] = None
    geoname: str = None
    coordinates: str = None

    @validator('geoname', 'coordinates')
    def try_decode_base64(cls, v, values, **kwargs):
        if values.get('base64') != 1:
            return v
        try:
            return base64.b64decode(v).decode('UTF-16')
        except Exception:
            ValueError("Ошибка декодирования base64, корректно ли выставлен параметр base64")
