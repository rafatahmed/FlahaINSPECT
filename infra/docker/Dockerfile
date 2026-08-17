# Shared Node image for @flaha/inspect-api and @flaha/inspect-worker.
# Build context is the monorepo root.
FROM node:20-bookworm-slim AS deps
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/api-client/package.json packages/api-client/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY apps/worker apps/worker
COPY packages/api-client packages/api-client
ARG PKG
RUN pnpm --filter "${PKG}" build

FROM node:20-bookworm-slim AS runner
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo /repo
ARG APP
ENV APP=${APP}
USER node
EXPOSE 3001
CMD ["sh", "-c", "node apps/${APP}/dist/main.js"]
