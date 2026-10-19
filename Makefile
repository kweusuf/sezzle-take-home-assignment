GO ?= go
NPM ?= npm

.PHONY: test test-backend test-frontend build build-backend build-frontend \
	run-backend run-frontend coverage coverage-backend coverage-frontend \
	fmt-check fmt-check-backend fmt-check-frontend smoke \
	docker-build docker-up docker-down

test: test-backend test-frontend

test-backend:
	cd backend && $(GO) test ./...

test-frontend:
	cd frontend && $(NPM) test

build: build-backend build-frontend

build-backend:
	cd backend && $(GO) build ./...

build-frontend:
	cd frontend && $(NPM) run build

run-backend:
	cd backend && $(GO) run ./cmd/server

run-frontend:
	cd frontend && $(NPM) run dev

coverage: coverage-backend coverage-frontend

coverage-backend:
	cd backend && $(GO) test ./... -coverprofile=coverage.out
	cd backend && $(GO) tool cover -func=coverage.out

coverage-frontend:
	cd frontend && $(NPM) run test:coverage

fmt-check: fmt-check-backend fmt-check-frontend

fmt-check-backend:
	cd backend && test -z "$$(gofmt -l .)"
	cd backend && $(GO) vet ./...

fmt-check-frontend:
	cd frontend && $(NPM) run typecheck

smoke:
	./scripts/smoke.sh

docker-build:
	docker compose build

# Frontend on http://localhost:8081 (override with FRONTEND_PORT).
docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
