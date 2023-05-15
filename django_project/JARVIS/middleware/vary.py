from django.utils.deprecation import MiddlewareMixin


class RemoveVaryHeader(MiddlewareMixin):
    """Remove Vary Header
    """

    def process_response(self, request, response):
        if hasattr(response, "remove_vary") and "vary" in response.headers:
            del response.headers['vary']
        return response


class SetVaryHeader(MiddlewareMixin):
    """Middleware to set Vary HTTP Header
    """

    def process_response(self, request, response):
        if hasattr(request, "vary_header") and "vary" in response.headers:
            response.headers['vary'] = request.vary_header
        return response
