def string_replace(original_string: str | None = None, replacement_dict: dict | None = None) -> str | None:
    if original_string and isinstance(replacement_dict, dict):
        trans_table = str.maketrans(replacement_dict)
        return original_string.translate(trans_table)
