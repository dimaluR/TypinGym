import logging
import os
from app import config, word_processor
import uvicorn


if __name__ == "__main__":
    config.run()
    uvicorn_options = {
        "host": os.environ["UVICORN_HOST"],
        "port": int(os.environ["UVICORN_PORT"]),
    }
    if os.environ["ENV"] == "dev":
        uvicorn_options.update(
            {
                "ssl_keyfile": os.environ["SSL_KEY_PATH"],
                "ssl_certfile": os.environ["SSL_CERT_PATH"],
                "reload": True,
            }
        )
    logging.info(f"{uvicorn_options}")
    uvicorn.run(
        app="app.api:app",
        **uvicorn_options,
    )
