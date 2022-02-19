from django.utils.deprecation import MiddlewareMixin
import sentry_sdk


class SentryMiddleware(MiddlewareMixin):
    """ setting context for sentry """

    def process_request(self, request):

        if hasattr(request, "user") and hasattr(request.user, "username"):
            sentry_sdk.set_user({"username": request.user.username})
        return
