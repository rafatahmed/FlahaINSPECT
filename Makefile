# FlahaINSPECT — developer entry points.
# Node workspaces: pnpm + Turborepo.
# Mobile: Flutter CLI only (not a turbo package).

PNPM ?= corepack pnpm
MOBILE := apps/mobile
COMPOSE_ENV := $(if $(wildcard .env),.env,.env.example)
COMPOSE := docker compose -f infra/docker-compose.yml --env-file $(COMPOSE_ENV)

.PHONY: help install lint test typecheck build \
	api-dev web-dev worker-dev dev \
	mobile-get mobile-analyze mobile-test mobile-run \
	up down logs ps smoke migrate migrate-twice seed

help:
	@echo "FlahaINSPECT targets"
	@echo "  make install         pnpm install (Node workspaces)"
	@echo "  make lint test typecheck build"
	@echo "  make api-dev | web-dev | worker-dev | dev"
	@echo "  make mobile-get | mobile-analyze | mobile-test | mobile-run"
	@echo "  make up | down | logs | ps | smoke"
	@echo "  make migrate | migrate-twice | seed"

install:
	$(PNPM) install

lint:
	$(PNPM) lint

test:
	$(PNPM) test
	$(PNPM) run test:infra

typecheck:
	$(PNPM) typecheck

build:
	$(PNPM) build

api-dev:
	$(PNPM) --filter @flaha/inspect-api dev

web-dev:
	$(PNPM) --filter @flaha/inspect-web dev

worker-dev:
	$(PNPM) --filter @flaha/inspect-worker dev

dev:
	$(PNPM) dev

mobile-get:
	cd $(MOBILE) && flutter pub get

mobile-analyze:
	cd $(MOBILE) && flutter analyze

mobile-test:
	cd $(MOBILE) && flutter test

mobile-run:
	cd $(MOBILE) && flutter run

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps

smoke:
	$(COMPOSE) ps
	curl -sf http://127.0.0.1:3001/health
	curl -sf http://127.0.0.1:3001/health/ready

migrate:
	$(PNPM) --filter @flaha/inspect-api db:migrate

migrate-twice:
	$(PNPM) --filter @flaha/inspect-api db:migrate:twice

seed:
	$(PNPM) --filter @flaha/inspect-api db:seed
