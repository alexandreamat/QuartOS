from fastapi import HTTPException, status


class SyncedEntity(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status.HTTP_403_FORBIDDEN, "User institution link is automatically synced"
        )


class UserInstitutionLinkNotFound(HTTPException):
    def __init__(self) -> None:
        super().__init__(status.HTTP_404_NOT_FOUND, "User institution link not found")


class ForbiddenUserInstitutionLink(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status.HTTP_403_FORBIDDEN,
            "User institution link does not belong to the user",
        )
