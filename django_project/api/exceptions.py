class OCRException(Exception):
    pass


class UploadFileNotExists(OCRException):
    def __init__(self):
        super().__init__(
            "Upload file not exists"
        )


class UploadFileUnknownType(OCRException):
    def __init__(self):
        super().__init__(
            "Upload file of unknown type"
        )


class TesseractException(OCRException):
    def __init__(self):
        super().__init__(
            "Upload file not exists"
        )
