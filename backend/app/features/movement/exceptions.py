from fastapi import HTTPException, status


class MovementNotFound(HTTPException):
    def __init__(self) -> None:
        super().__init__(status.HTTP_404_NOT_FOUND, "Movement not found")
