FROM node:18.20.8 AS builder_web

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.9

ADD ./package.json /app/package.json
ADD ./pnpm-lock.yaml /app/pnpm-lock.yaml

# 使用 BuildKit 缓存挂载来缓存 pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

ARG IMAGE_TAG
ENV IMAGE_TAG=$IMAGE_TAG
ARG BRANCH
ENV BRANCH=$BRANCH

ADD ./ /app

RUN pnpm run build-types branch=$BRANCH && pnpm run build

FROM nginx:stable-alpine-slim

COPY --from=builder_web /app/dist /app/dist
COPY --from=builder_web /app/nginx.conf /etc/nginx/conf.d/default.conf