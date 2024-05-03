BACKEND_HOST = localhost
BACKEND_PORT = 5007
install-dependencies:
	@echo "Installing backend dependencies..."
	@pip install -r backend/requirements.txt
	@echo "Installing frontend dependencies..."
	@npm install --prefix frontend

run-backend:
	uvicorn backend.app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload

run-frontend:
	npm run --prefix frontend dev -- --open

run:
	@make run-backend & make run-frontend

