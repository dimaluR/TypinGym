BACKEND_HOST = localhost
BACKEND_PORT = 5007

run-backend:
	uvicorn backend.api.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload

run-frontend:
	npm run --prefix frontend dev -- --open
