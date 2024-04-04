FROM python:3.11-alpine

ENV PYTHONBUFFERED True

ENV APP_HOME=/app
WORKDIR $APP_HOME
COPY ./app ./app
COPY requirements.txt .

RUN pip install -r requirements.txt

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5007" ]
