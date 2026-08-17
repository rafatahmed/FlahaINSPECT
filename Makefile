# FlahaINSPECT — developer entry points.
# Node workspaces: pnpm + Turborepo.
# Mobile: Flutter CLI only (not a turbo package).
# `make up` / compose is PR-02.

PNPM ?= corepack pnpm
MOBILE := apps/mobile

.PHONY: help install lint test typecheck build \
	api-dev web-dev worker-dev dev \
	mobile-get mobile-analyze mobile-test mobile-run \
	up down

help:
	@echo "FlahaINSPECT targets"
	@echo "  make install         pnpm install (Node workspaces)"
	@echo "  make lint test typecheck build"
	@echo "  make api-dev | web-dev | worker-dev | dev"
	@echo "  make mobile-get | mobile-analyze | mobile-test | mobile-run"
	@echo "  make up | down       PR-02 (docker compose) — not in this PR"

install:
	$(PNPM) install

lint:
	$(PNPM) lint

test:
	$(PNPM) test

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
	@echo "PR-02: docker compose is not in this PR. See Docs/ROADMAP.md R1-02."
	@exit 1

down:
	@echo "PR-02: docker compose is not in this PR."
	@exit 1
