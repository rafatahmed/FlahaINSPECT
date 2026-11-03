#!/usr/bin/env bash
set -eu

# Compare the whole PR, including deletions and both sides of moved files.
if [[ "$GITHUB_EVENT_NAME" == pull_request ]]; then
  BASE=$(git merge-base "$BASE" "$HEAD")
elif [[ "$BASE" =~ ^0+$ ]]; then
  BASE=$(git hash-object -w -t tree /dev/null)
fi

route() {
  local job=$1 status
  shift
  if git diff --quiet --no-renames "$BASE" "$HEAD" -- .github/workflows/ci.yml .github/ci/affected.sh "$@"; then
    echo "$job=false"
  else
    status=$?
    if [[ $status != 1 ]]; then exit "$status"; fi
    echo "$job=true"
  fi
}

workspace=(apps/api apps/worker packages openapi package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc .nvmrc tsconfig.base.json turbo.json)
contract=(infra/compose-contract.test.mjs infra/docker-compose.yml infra/minio/init.sh infra/e2e/pilot-smoke.mjs .env.example)
route node "${workspace[@]}" "${contract[@]}" apps/web
route compose "${workspace[@]}" infra .env.example .dockerignore apps/web/package.json
route flutter apps/mobile
