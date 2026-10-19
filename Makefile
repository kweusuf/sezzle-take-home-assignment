GO ?= go
NPM ?= npm

.PHONY: test-backend build-backend run-backend coverage-backend fmt-check fmt-check-backend

test-backend:
	cd backend && $(GO) test ./...

build-backend:
	cd backend && $(GO) build ./...

run-backend:
	cd backend && $(GO) run ./cmd/server

coverage-backend:
	cd backend && $(GO) test ./... -coverprofile=coverage.out
	cd backend && $(GO) tool cover -func=coverage.out

fmt-check-backend:
	cd backend && test -z "$$(gofmt -l .)"
	cd backend && $(GO) vet ./...

fmt-check: fmt-check-backend
