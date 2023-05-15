
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
import json


@deconstructible
class JsonTextValidator:
    message = _('Invalid JSON format')
    code = 'invalid'

    def __init__(self, message=None, code=None):
        if message is not None:
            self.message = message
        if code is not None:
            self.code = code

    def __call__(self, value):
        try:
            json.loads(str(value))
        except Exception as error:
            raise ValidationError(
                message=f"{self.message}: {error}",
                code=self.code
            ) from error
