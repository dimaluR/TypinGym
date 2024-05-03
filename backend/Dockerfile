FROM python:3.11-slim-buster
ENV PYTHONBUFFERED=True

ENV APP_HOME=/app
WORKDIR $APP_HOME
COPY ./app ./app
COPY requirements.txt .

RUN pip install -r requirements.txt

CMD sh -c "python -m app.main"
