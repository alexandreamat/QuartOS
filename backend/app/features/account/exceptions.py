from fastapi import HTTPException, status


class AccountNotFound(HTTPException):
    def __init__(self) -> None:
        super().__init__(status.HTTP_404_NOT_FOUND, "Account not found")


class ForbiddenAccount(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status.HTTP_403_FORBIDDEN, "Account does not belong to the user"
        )
