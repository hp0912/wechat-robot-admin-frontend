FROM yunke-registry.cn-hangzhou.cr.aliyuncs.com/yued/node-image-base:v18.20.3-alpine-rc AS builder_web

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

FROM yunke-registry.cn-hangzhou.cr.aliyuncs.com/yued/nginx-base:1.21.0-alpine-1.1.0

LABEL sync-cdn="true" sync-cdn-pre-action="/docker-entrypoint.d/replace.sh" sync-cdn-by-deploy-env="1" sync-cdn-target="/app/dist" probe="none"

COPY --from=builder_web /app/dist /app/dist
COPY --from=builder_web /app/nginx.conf /etc/nginx/conf.d/default.conf