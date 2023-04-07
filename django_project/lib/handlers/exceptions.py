class HandlerError(Exception):
    pass


class HandlerInitError(HandlerError):
    def __init__(self, message: str = ''):
        super().__init__(f"Handler Init Error: {message}")


class HandlerConnectionError(HandlerError):
    def __init__(self, message: str = ''):
        super().__init__(f"Connection Error: {message}")


class HandlerExecutionError(HandlerError):
    def __init__(self, message: str = ''):
        super().__init__(f"Execution Error: {message}")
