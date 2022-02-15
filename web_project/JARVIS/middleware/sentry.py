from django.utils.deprecation import MiddlewareMixin
import sentry_sdk


class SentryMiddleware(MiddlewareMixin):
    """ setting context for sentry """

    def process_request(self, request):

        if hasattr(request, "user") and hasattr(request.user, "username"):
            # id username email ip_address
            sentry_sdk.set_user({"username": request.user.username})
            # sentry_sdk.set_context("character", {
            #     "name": "Mighty Fighter",
            #     "age": 19,
            #     "attack_type": "melee"
            # })
        return
