import pytesseract
from PIL import Image
import io
from .exceptions import (
    UploadFileNotExists, UploadFileUnknownType, TesseractException)
from security.models import User
from lib.routine import string_replace
from JARVIS.enums import TESSERACT_PARAMS
from typing import Union, Any
from dataclasses import dataclass


@dataclass
class OCR:
    user: User
    file: Any

    # def __init__(self, user: User, file: Any) -> None:
    #     self._user = user
    #     self._file = file

    def _get_first_image_file(self) -> Union[Any, None]:
        """get file from request

        :raises UploadFileNotExists: if file not exists in the upload request
        :raises UploadFileUnknownType: if file of unknown type
        :return: Image or None
        :rtype: Union[Any, None]
        """
        # if not self._files:
        #     raise UploadFileNotExists()

        # for filename, file in self._files.items():
        #     # name = request.FILES[filename].name;
        #     try:
        #         # file = self._files[filename].read()
        #         image_file = file.read()
        #         image = Image.open(io.BytesIO(image_file))
        #         image.load()
        #         return image
        #     except Exception as error:
        #         raise UploadFileUnknownType() from error
        if not self.file:
            raise UploadFileNotExists()

        try:
            # file = self._files[filename].read()
            image_file = self.file.read()
            image = Image.open(io.BytesIO(image_file))
            image.load()
            return image
        except Exception as error:
            raise UploadFileUnknownType() from error

    def _execute_tesseract(self, image: Any) -> str:
        """execute tesseract

        :param image: PIL image
        :type image: Any
        :return: recognized text from image
        :rtype: Union[str, None]
        """
        try:
            return pytesseract.image_to_string(image, config=TESSERACT_PARAMS)
        except Exception as error:
            raise TesseractException from error

    def _prepare_recognized_text(self, text: str) -> str:
        """prepare result text

        :param text: text
        :type text: Union[str, None]
        :return: prepeared text
        :rtype: str
        """
        reault_text = string_replace(text, {'\r': '', '\n': ' '}) or ''
        return reault_text.strip()

    def get_text(self) -> str:
        """recognize text from image

        :raises UploadFileNotExists: if file not exists in the upload request
        :raises UploadFileUnknownType: if file of unknown type
        :raises TesseractException: TesseractException
        :return: recognized text
        :rtype: str
        """
        image_file = self._get_first_image_file()
        recognized_text = self._execute_tesseract(image_file)
        return self._prepare_recognized_text(recognized_text)
