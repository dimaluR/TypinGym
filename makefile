BACKEND_HOST = localhost
BACKEND_PORT = 5007
PROJECT_ID = typingym-85269
install-dependencies:
	@echo "Installing backend dependencies..."
	@pip install -r backend/requirements.txt
	@echo "Installing frontend dependencies..."
	@npm install --prefix frontend

build-backend:
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/backend

deploy-backend:
	gcloud run deploy --image gcr.io/$(PROJECT_ID)/backend --port=$(BACKEND_PORT)

run-backend:
	uvicorn backend.app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload

run-frontend:
	npm run --prefix frontend dev -- --open

run:
	@make run-backend & make run-frontend
