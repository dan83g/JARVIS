from typing import Dict
from .import models


def get_geo_json_coordinates(text_with_coordinates: str) -> Dict:
    coodinates_list = []
    coordinates = models.coordinate.objects.filter(active=True).order_by('priority')
    for row in coordinates:
        coodinates_list.extend(row.get_geo_json_coordinates(text_with_coordinates))
    return coodinates_list
