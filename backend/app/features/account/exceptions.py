from fastapi import HTTPException, status


class ForbiddenAccount(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status.HTTP_403_FORBIDDEN, "Account does not belong to the user"
        )
