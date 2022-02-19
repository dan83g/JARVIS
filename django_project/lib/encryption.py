import json
import hashlib
from .encoders import JsonEncoder


def md5hash(data: any) -> str:
    json_encoded_string = json.dumps(data, cls=JsonEncoder, ensure_ascii=False).encode('utf-8')
    return hashlib.md5(json_encoded_string).hexdigest()
