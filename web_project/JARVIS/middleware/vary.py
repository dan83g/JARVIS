from django.utils.deprecation import MiddlewareMixin
# if not needed position of middelware
# from django.utils.decorators import decorator_from_middleware
# remove_vary = decorator_from_middleware(RemoveVaryHeader)


class RemoveVaryHeader(MiddlewareMixin):
    """ remove VaryHeader if remove_vary-decorator is present """

    def process_response(self, request, response):
        if hasattr(response, "remove_vary") and "vary" in response._headers:
            del response._headers['vary']
        return response
