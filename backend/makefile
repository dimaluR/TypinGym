BACKEND_HOST = 127.0.0.1
BACKEND_PORT = 5007
PROJECT_ID = typingym-85269
SERVICE_NAME = typingym-api
SSL_KEY=.ssl/key.pem
SSL_CERT=.ssl/cert.pem
build:
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/backend

deploy:
	gcloud run deploy $(SERVICE_NAME) --image gcr.io/$(PROJECT_ID)/backend --port=$(BACKEND_PORT)

run:
	uvicorn app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload --ssl-keyfile $(SSL_KEY) --ssl-certfile $(SSL_CERT)

dev-build:
	docker build -t typingym-api .

dev-deploy:
	docker run --name $(SERVICE_NAME) -p 5007:5007 $(SERVICE_NAME)
