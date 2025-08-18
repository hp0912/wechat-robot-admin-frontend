# 微信机器人管理后台 - 前端

## 开发

> 开发前准备，确保自己的Nodejs版本在18以及以上，pnpm版本需要限定在8.x，pnpm版本太高，pnpm-lock.yaml 文件会不兼容
>
> Node.js 16.10 及以上自带了 corepack，它可以帮助你管理和切换 pnpm（以及 yarn）的版本
>
> 启用 corepack（如果还没启用）
>
> `corepack enable`
>
> `corepack prepare pnpm@8.15.9 --activate`
>
> `pnpm -v`

1. 安装依赖 (需要 nodejs 18 及以上) `pnpm install`
2. 生成客户端接口 `pnpm run build-types`
3. 启动 `pnpm run dev`
