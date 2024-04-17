FROM python:3.11-slim-buster
ENV PYTHONBUFFERED=True
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=5007

ENV APP_HOME=/app
WORKDIR $APP_HOME
COPY ./app ./app
COPY requirements.txt .

RUN pip install -r requirements.txt

CMD sh -c "uvicorn app.main:app --host $UVICORN_HOST --port $UVICORN_PORT"
