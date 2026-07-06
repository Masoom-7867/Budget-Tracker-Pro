# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base: install dependencies once, reused by both the dev and build stages
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# Dev: runs the Vite dev server with hot reload (used by docker-compose for
# local development - source is bind-mounted over this in compose.yml)
# ---------------------------------------------------------------------------
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 4028
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]

# ---------------------------------------------------------------------------
# Build: produces the static production bundle in /app/build
#
# IMPORTANT: Vite inlines VITE_* env vars into the JS bundle at BUILD time,
# not at container-run time. They must be passed as build args here, not as
# `environment:` on the final container - setting them at `docker run` time
# would have no effect on an already-built bundle.
# ---------------------------------------------------------------------------
FROM deps AS build
WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Production: nginx serving the static build, with SPA fallback so client-side
# routes (react-router) resolve correctly on refresh/direct URL access
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
