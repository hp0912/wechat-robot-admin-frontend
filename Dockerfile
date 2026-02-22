# syntax=docker/dockerfile:1.7
FROM node:18.20.8 AS builder_web

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

COPY package.json pnpm-lock.yaml .npmrc ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store && \
  pnpm install --frozen-lockfile

ARG IMAGE_TAG
ENV IMAGE_TAG=$IMAGE_TAG
ARG BRANCH
ENV BRANCH=$BRANCH

COPY . .

RUN pnpm run build-types branch=$BRANCH && pnpm run build

FROM nginx:stable-alpine-slim

COPY --from=builder_web /app/dist /app/dist
COPY --from=builder_web /app/nginx.conf /etc/nginx/conf.d/default.conf