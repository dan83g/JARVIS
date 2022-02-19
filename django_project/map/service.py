from django.core.cache import cache, InvalidCacheBackendError
from django.contrib.auth.models import User
from typing import Dict, List, Union
import re
from lib.encryption import md5hash
from .models import coordinate
from .exceptions import (
    CoordinatesDoesNotExistsInCache, CoordinatesTypesDoesNotExists, CacheGetError, CacheSetError)
from JARVIS.enums import REDIS_CACHE_TTL


class CoordinatesCache:
    @staticmethod
    def get(user: User, hash: str) -> List[Dict]:
        """get coordinates ffrom cache

        :param hash: md5 hash as key
        :type hash: str
        :raises CacheGetError: if cache failure
        :raises CoordinatesDoesNotExistsInCache: if coordinates ware not found in cache
        :return: Coordinates in GeoJson format
        :rtype: List[Dict]
        """
        try:
            coordinates = cache.get(f"user:{user.id}:{hash}")
        except InvalidCacheBackendError as error:
            raise CacheGetError(hash) from error
        if not coordinates:
            raise CoordinatesDoesNotExistsInCache()
        return coordinates

    @staticmethod
    def set(user: User, coordinates: List[Dict]) -> str:
        """set coordinates in cache for future usage

        :param coordinates: Coordinates in GeoJson format
        :type coordinates: List[Dict]
        :raises CacheSetError: if cache failure
        :return: md5 hash as key
        :rtype: str
        """
        hash = md5hash(coordinates)
        try:
            cache.set(f"user:{user.id}:{hash}", coordinates, timeout=REDIS_CACHE_TTL)
        except InvalidCacheBackendError as error:
            raise CacheSetError() from error
        return hash


class Coordinates:
    def __init__(self, user: User) -> None:
        self._user = user

    def _get_coordinate_regexps(self) -> List[Dict]:
        """get regular expressions from database for parsing coordinates

        :raises CoordinatesTypesDoesNotExists: if Coordinate types was not found in db
        :return: _description_
        :rtype: Optional[List[Dict]]
        """
        try:
            return list(
                coordinate.objects.filter(active=True).values('regexp').order_by('priority')
            )
        except coordinate.DoesNotExist as error:
            raise CoordinatesTypesDoesNotExists() from error

    def _get_geojson_coordinate(self, longitude: float, latitude: float, title: Union[str, None]) -> Dict:
        # in GeoJson: latitude after longitude
        return {
            "type": "Feature",
            "properties": {
                "title": title,
            },
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            }
        }

    def _get_coordinates(self, regexp: str, text_with_coordinates: str) -> List[Dict]:
        """parsing text with regular expression

        :param regexp: regular expression
        :type regexp: str
        :return: List of coordinates in GeoJson format
        :rtype: List[Dict]
        """
        result_list = []
        for match in re.finditer(regexp, text_with_coordinates):
            named_groups = match.groupdict()
            if not ({'lat', 'long', 'lat_dec', 'long_dec'} <= set(named_groups.keys())):
                continue

            try:
                long = float(
                    f"{named_groups.get('long')}.{named_groups.get('long_dec')}"
                )
                lat = float(
                    f"{named_groups.get('lat')}.{named_groups.get('lat_dec')}"
                )
            except ValueError:
                continue

            result_list.append(
                self._get_geojson_coordinate(longitude=long, latitude=lat, title=named_groups.get('text', ''))
            )
        return result_list

    def get_geojson_coordinates(self, text_with_coordinates: str, hash: str) -> List[Dict]:
        """getting coordinates from text and use them for prepearing GeoJson

        :return: List of coordinates in GeoJson format
        :rtype: List[Dict]
        """
        if hash:
            return CoordinatesCache.get(user=self._user, hash=hash)
        coodinates = []
        for regexp in self._get_coordinate_regexps():
            coodinates.extend(
                self._get_coordinates(regexp=regexp, text_with_coordinates=text_with_coordinates)
            )
        return coodinates
