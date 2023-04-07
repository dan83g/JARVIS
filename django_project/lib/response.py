from django.http import JsonResponse
from JARVIS.enums import HTTP_ERROR_CODE

JSON_DUMPS_PARAMS = {
    'ensure_ascii': False
}


class Response:
    """Base class for responses"""
    def __init__(self) -> None:
        pass

    @staticmethod
    def json_response(message: str = 'Ошибка', status: str = 'error', status_code: int = HTTP_ERROR_CODE) -> JsonResponse:
        """send error in webix format

        :param message: message with errors and warnings, defaults to 'Ошибка'
        :type message: str, optional
        :param status: webix status, defaults to 'success'
        :type status: str, optional
        :param status_code: HTTP response stats code, defaults to 200
        :type status_code: int, optional
        :return: json with errors
        :rtype: JsonResponse
        """
        return JsonResponse(
            {'status': status, 'message': message},
            safe=False, status=status_code,
            json_dumps_params=JSON_DUMPS_PARAMS
        )

    @staticmethod
    def json_data_response(data: list[dict] | dict, message: str = 'OK', status: str = 'success', status_code: int = 200) -> JsonResponse:
        """send data in webix format

        :param data: list with data, defaults to []
        :type data: list, optional
        :param message: message with errors and warnings, defaults to 'Ошибка'
        :type message: str, optional
        :param status: webix status, defaults to 'success'
        :type status: str, optional
        :param status_code: HTTP response stats code, defaults to 200
        :type status_code: int, optional
        :return: json with data
        :rtype: JsonResponse
        """
        return JsonResponse(
            {'status': status, 'message': message, 'data': data},
            safe=False,
            status=status_code,
            json_dumps_params=JSON_DUMPS_PARAMS
        )
