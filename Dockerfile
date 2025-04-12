FROM node:20.19.8-slim AS builder_web

ENV CI=1

WORKDIR /app
ADD ./package.json /app/package.json
ADD ./pnpm-lock.yaml /app/pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

ARG IMAGE_TAG
ENV IMAGE_TAG=$IMAGE_TAG
ARG BRANCH
ENV BRANCH=$BRANCH

ADD ./ /app

RUN pnpm run build-types branch=$BRANCH && pnpm run build

FROM nginx:stable-alpine-slim

COPY --from=builder_web /app/dist /app/dist
COPY --from=builder_web /app/nginx.conf /etc/nginx/conf.d/default.conf