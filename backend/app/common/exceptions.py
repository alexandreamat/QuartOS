from fastapi import HTTPException, status


class UnknownError(HTTPException):
    def __init__(self, e: Exception) -> None:
        exc_message = getattr(e, "message", str(e))
        error_message = f"{type(e).__name__}: {exc_message}"
        raise HTTPException(status.HTTP_400_BAD_REQUEST, error_message)
