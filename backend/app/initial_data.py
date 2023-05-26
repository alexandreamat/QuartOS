import logging

from sqlmodel import Session
from app.database.init_db import init_db
from app.database.deps import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    logger.info("Creating initial data")
    with Session(engine) as db:
        init_db(db)
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
