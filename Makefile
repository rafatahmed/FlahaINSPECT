# FlahaINSPECT — developer entry points.
# Node workspaces: pnpm + Turborepo.
# Mobile: Flutter CLI only (not a turbo package).
# Flutter pin: apps/mobile/.flutter-version — install via make mobile-bootstrap.

PNPM ?= corepack pnpm
MOBILE := apps/mobile
COMPOSE_ENV := $(if $(wildcard .env),.env,.env.example)
COMPOSE := docker compose -f infra/docker-compose.yml --env-file $(COMPOSE_ENV)

# Prefer PATH, then the bootstrap location (%LOCALAPPDATA%/flutter).
FLUTTER ?= $(shell command -v flutter 2>/dev/null)
ifeq ($(FLUTTER),)
  ifneq ($(LOCALAPPDATA),)
    ifneq ($(wildcard $(LOCALAPPDATA)/flutter/bin/flutter.bat),)
      FLUTTER := "$(LOCALAPPDATA)/flutter/bin/flutter.bat"
    endif
  endif
endif
ifeq ($(FLUTTER),)
  FLUTTER := flutter
endif

.PHONY: help install lint test typecheck build \
	api-dev web-dev worker-dev dev \
	mobile-bootstrap mobile-get mobile-generate mobile-analyze mobile-test mobile-run \
	up down logs ps smoke migrate migrate-twice seed

help:
	@echo "FlahaINSPECT targets"
	@echo "  make install         pnpm install (Node workspaces)"
	@echo "  make lint test typecheck build"
	@echo "  make api-dev | web-dev | worker-dev | dev"
	@echo "  make mobile-bootstrap   install pinned Flutter (once per machine)"
	@echo "  make mobile-get | mobile-generate | mobile-analyze | mobile-test | mobile-run"
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

mobile-bootstrap:
	pwsh -File $(MOBILE)/tool/bootstrap-flutter.ps1

mobile-get:
	cd $(MOBILE) && $(FLUTTER) pub get

mobile-generate:
	cd $(MOBILE) && $(FLUTTER) pub get && $(FLUTTER) pub run build_runner build

mobile-analyze:
	cd $(MOBILE) && $(FLUTTER) analyze --no-fatal-infos

mobile-test:
	cd $(MOBILE) && $(FLUTTER) test

mobile-run:
	cd $(MOBILE) && $(FLUTTER) run --dart-define=API_BASE_URL=http://127.0.0.1:3001

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
