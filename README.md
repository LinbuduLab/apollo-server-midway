# apollo-server-midway

[English](./README.en-US.md) | 简体中文

## 🎉 Announcing V 1.0

现在你可以在 [Midway Serverless](https://www.yuque.com/midwayjs/midway_v2/serverless_introduction) 中使用 [Apollo-Server](https://www.apollographql.com/docs/apollo-server) 和 [TypeGraphQL](https://github.com/MichalLytek/type-graphql) 了：

- 支持 `Apollo Server` 与 `TypeGraphQL` 绝大部分在 `Serverless` 场景下的可用配置
- 支持 `Serverless` 应用（通过 `Apollo-Server` 作为解析器） 与 普通 Node 应用（通过 `Apollo-Server` 作为中间件，目前仅 `Koa` 版本可用，`Express` / `EggJS` 马上就来）
- 内置开箱即用的插件功能，如 [Query Complexity](packages/apollo-query-complexity)、[Resolve Time](packages/apollo-resolve-time) 等，后续还会有更多插件。
- 集成 `Midway Container` 的 `Debug` 能力（如在 `GraphQL Response` 中通过 `extensions` 字段返回上下文、`GraphQL Schema` 等信息）
- 基于 [Apollo Server V3](https://www.apollographql.com/docs/apollo-server/migration/)，默认禁用 `Apollo Sandbox`，使用 `GraphQL Playground`
- 90+ 单测覆盖率

在开始前，你可以通过 [experimental-midway-sls-graphql](https://github.com/linbudu599/experimental-midway-sls-graphql) 和 [sample](packages/sample/src/function/hello.ts) 来了解大概的使用方式。

> 详细文档参考：[在 Midway(Serverless) 中使用 GraphQL](https://www.yuque.com/midwayjs/midway_v2/qfdtnx)

## Quick Start

### Apollo-Server + Midway Serverless

在 Serverless 场景中使用 [apollo-server-midway](packages/apollo-server-midway) ：

```bash
npm install apollo-server-midway --save
yarn add apollo-server-midway --save
pnpm install apollo-server-midway --save
```

```typescript
import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessFunction,
  ServerlessTriggerType,
  App,
} from "@midwayjs/decorator";
import { Context, IMidwayFaaSApplication } from "@midwayjs/faas";
import { createApolloServerHandler } from "apollo-server-midway";
import path from "path";

const apolloHandlerFuncName = "apollo-handler";

const APOLLO_SERVER_MIDWAY_PATH = "/apollo";

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @App()
  app: IMidwayFaaSApplication;

  @ServerlessFunction({
    functionName: apolloHandlerFuncName,
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: APOLLO_SERVER_MIDWAY_PATH,
    method: "get",
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: APOLLO_SERVER_MIDWAY_PATH,
    method: "post",
  })
  async apolloHandler() {
    return await createApolloServerHandler({
      path: "/",
      app: this.app,
      context: this.ctx,
      // NOTE: schema 是必须的, 使用 schema.resolvers 或者 apollp.schema 来指定
      // 一旦 apollo.schema 被指定，schema.resolvers 就将被忽略
      schema: {
        resolvers: [path.resolve(this.app.getBaseDir(), "resolvers/*")],
      },
    });
  }
}
```

在上面的示例中，函数 `apollo-handler` 将被部署在 `SLS_DOMAIN/SERVICE/apollo-handler` 下，你可以通过 `SLS_DOMAIN/SERVICE/apollo-handler/` 访问（注意 `/`）。

### Apollo-Server + Midway Node Application(Not Stable!)

在 Node 应用中使用 [apollo-server-midway](packages/apollo-server-midway/lib/app/graphql-middleware.ts)

你可以查看 [koa-app-sample](packages/koa-app-sample) 获得更多信息。

```typescript
// config.default.ts
import { CreateGraphQLMiddlewareOption } from "apollo-server-midway";

export const graphql: CreateGraphQLMiddlewareOption = {};

// configuration.ts
import { Configuration, App } from "@midwayjs/decorator";
import { ILifeCycle } from "@midwayjs/core";
import { IMidwayKoaApplication } from "@midwayjs/koa";
import * as GraphQL from "apollo-server-midway";

@Configuration({
  imports: [GraphQL],
  importConfigs: ["./config"],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayKoaApplication;

  async onReady(): Promise<void> {
    // Component Namespace:Framework-Specified Middleware Identifier
    // graphql:GraphQLExpressMiddleware
    this.app.use(
      await this.app.generateMiddleware("graphql:GraphQLKoaMiddleware")
    );
  }
}
```
