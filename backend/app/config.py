import logging
import dotenv
from app import basedir

PATH_DOTENV_PROD = basedir / ".env.production"
PATH_DOTENV_LOCAL = basedir / ".env.development.local"
logging.basicConfig(level=logging.INFO)

def setup_environment():
    if PATH_DOTENV_LOCAL.exists():
        logging.info("found local dotenv")
        dotenv.load_dotenv(PATH_DOTENV_LOCAL)

    if PATH_DOTENV_PROD.exists():
        logging.info("found prod dotenv")
        dotenv.load_dotenv(PATH_DOTENV_PROD)


def run():
    setup_environment()
