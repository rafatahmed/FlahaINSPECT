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
	mobile-bootstrap mobile-bootstrap-android mobile-get mobile-generate mobile-analyze mobile-test \
	mobile-run mobile-run-android mobile-run-windows mobile-doctor \
	up down logs ps smoke migrate migrate-twice seed \
	tiles-prepare tiles-up

help:
	@echo "FlahaINSPECT targets"
	@echo "  make install         pnpm install (Node workspaces)"
	@echo "  make lint test typecheck build"
	@echo "  make api-dev | web-dev | worker-dev | dev"
	@echo "  make mobile-bootstrap   install pinned Flutter (once per machine)"
	@echo "  make mobile-bootstrap-android  Android SDK + flaha_inspect_api35 AVD"
	@echo "  make mobile-get | mobile-generate | mobile-analyze | mobile-test"
	@echo "  make mobile-run | mobile-run-android | mobile-run-windows | mobile-doctor"
	@echo "  make up | down | logs | ps | smoke"
	@echo "  make migrate | migrate-twice | seed"
	@echo "  make tiles-prepare | tiles-up   G-01 TileServer GL (Qatar extract)"

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

# API 35 only. Uninstalls Flutter-floated NDK / API 36. AVD may land on D:.
mobile-bootstrap-android:
	pwsh -File $(MOBILE)/tool/bootstrap-android.ps1

mobile-doctor:
	$(FLUTTER) doctor -v

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

# Android emulator reaches the host via 10.0.2.2 (not 127.0.0.1).
mobile-run-android:
	cd $(MOBILE) && $(FLUTTER) run -d android --dart-define=API_BASE_URL=http://10.0.2.2:3001 --dart-define=FLAVOR=dev

mobile-run-windows:
	cd $(MOBILE) && $(FLUTTER) run -d windows --dart-define=API_BASE_URL=http://127.0.0.1:3001 --dart-define=FLAVOR=dev

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

tiles-prepare:
	pwsh -File infra/tiles/prepare-qatar.ps1

tiles-up:
	$(COMPOSE) --profile tiles up -d tiles
