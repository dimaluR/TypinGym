BACKEND_HOST = 127.0.0.1
BACKEND_PORT = 5007
PROJECT_ID = typingym-85269
SERVICE_NAME = typingym-app

build:
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/backend

deploy:
	gcloud run deploy $(SERVICE_NAME) --image gcr.io/$(PROJECT_ID)/backend --port=$(BACKEND_PORT)

push:
	@make build-backend & @make deploy-backend

run:
	uvicorn app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload

run-https:
	uvicorn app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload --ssl-keyfile .ssl/key.pem --ssl-certfile .ssl/cert.pem

