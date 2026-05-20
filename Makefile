.PHONY: infra up down clean

infra:
	docker-compose up -d --build

up: infra
	@echo "Serviços iniciados."

down:
	docker-compose down

clean:
	docker-compose down -v

tests-back:
	@cd backend && go test ./cmd/api/... -v

tests-front:
	@cd app && npm run test

tests-e2e:
	@cd cypress && npm run cypress:run
