from typing import Union


def to_bool(value: str) -> bool:
    return True if value.lower() in ('1', 'true', 'on', 'yes') else False


def string_replace(original_string: str = None, replacement_dict: dict = None) -> Union[str, None]:
    if original_string and isinstance(replacement_dict, dict):
        trans_table = str.maketrans(replacement_dict)
        return original_string.translate(trans_table)
