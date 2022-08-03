

def to_bool(value: str) -> bool:
    return True if value.lower() in ('1', 'true', 'on', 'yes') else False