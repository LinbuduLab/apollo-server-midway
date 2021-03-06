# apollo-server-midway

[English](./README.en-US.md) | 简体中文

> 推荐直接阅读 Midway 官方文档部分：[GraphQL | Midway](https://midwayjs.org/docs/2.0.0/extensions/graphql)
> 
> **V3 版本见 [apollo-server-midway-v3](https://github.com/LinbuduLab/apollo-server-midway-v3)（开发中）**

## 🎉 Announcing V 1.0

现在你可以在 [Midway Serverless](https://midwayjs.org/docs/serverless/serverless_intro) 中使用 [Apollo-Server(V3)](https://www.apollographql.com/docs/apollo-server) 和 [TypeGraphQL](https://github.com/MichalLytek/type-graphql) 了：

- 支持 `Apollo Server` 与 `TypeGraphQL` 绝大部分在 `Serverless` 场景下的可用配置
- 支持 `Serverless` 应用（通过 `Apollo-Server` 作为解析器） 与 普通 Node 应用（通过 `Apollo-Server` 作为中间件，已支持 `koa`/ `Express` 版本）
- 内置开箱即用的插件功能，如 [Query Complexity](packages/apollo-query-complexity)、[Resolve Time](packages/apollo-resolve-time) 等，后续还会有更多插件。
- 集成 `Midway Container` 的 `Debug` 能力（如在 `GraphQL Response` 中通过 `extensions` 字段返回上下文、`GraphQL Schema` 等信息）
- 基于 [Apollo Server V3](https://www.apollographql.com/docs/apollo-server/migration/)，默认禁用 `Apollo Sandbox`，使用 `GraphQL Playground`
- 90+ 单测覆盖率

在开始前，你可以通过 [experimental-midway-sls-graphql](https://github.com/linbudu599/experimental-midway-sls-graphql) 和 [sample](packages/sample/src/function/hello.ts) 来了解大概的使用方式。

> 详细文档参考：[在 Midway(Serverless) 中使用 GraphQL](https://midwayjs.org/docs/extensions/graphql)

## Quick Start

### Apollo-Server + Midway Serverless

在 Serverless 场景中使用 [apollo-server-midway](packages/apollo-server-midway) ：

```bash
npm install apollo-server-midway graphql type-graphql --save
yarn add apollo-server-midway graphql type-graphql --save
pnpm install apollo-server-midway graphql type-graphql --save
```

> `type-graphql` 是可选的依赖，如果你已经拥有构建完毕的 GraphQL Schema，可以不使用它。同时，请确保你在 MidwayJS 项目中使用，因为包括 `@midwayjs/core` 以及 `@midwayjs/decorator` 等的一批依赖被标记为 `peerDependencies`。

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
import { SampleResolver } from "../resolvers/sample.resolver";
import { DogResolver } from "../resolvers/dog.resolver";
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
      schema: {
        resolvers: [SampleResolver, DogResolver],
      },
    });
  }
}
```

在上面的示例中，函数 `apollo-handler` 将被部署在 `SLS_DOMAIN/SERVICE/apollo-handler` 下，你可以通过 `SLS_DOMAIN/SERVICE/apollo-handler/` 访问（注意 `/`）。

### Apollo-Server + Midway Node Application

```bash
npm install apollo-server-midway graphql type-graphql @midwayjs/koa --save
yarn add apollo-server-midway graphql type-graphql @midwayjs/koa --save
pnpm install apollo-server-midway graphql type-graphql @midwayjs/koa --save
```

> 将 `@midwayjs/koa` 替换为你应用对应的框架，目前仅有 Koa / Express 支持。

你可以查看 [koa-app-sample](packages/koa-app-sample) / [express-app-sample](packages/express-app-sample) 获得更多信息。

**在普通 Node 应用中，更推荐通过自己定义 `GraphQL` 中间件的方式来接入 GraphQL Server，因为其成本是非常低的，同时相比框架的黑盒，你可以更容易的做定制。`Apollo-Server-Midway`同样会更侧重 Serverless 能力相关，因为对于花样百出的 Node 应用定制需求，我们无法做到满足每一个使用者。关于如何定制，请参考 [文档-定制 GraphQL 中间件](https://midwayjs.org/docs/extensions/graphql#%E5%AE%9A%E5%88%B6-graphql-%E4%B8%AD%E9%97%B4%E4%BB%B6)。**

```typescript
// config.default.ts
import { SampleResolver } from "../resolvers/sample.resolver";
import { CreateGraphQLMiddlewareOption } from "apollo-server-midway";

export const graphql: CreateGraphQLMiddlewareOption = {
  schema: {
    resolvers: [SampleResolver],
  },
};

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
    this.app.use(
      // Express 下的命名空间：graphql:GraphQLExpressMiddleware
      await this.app.generateMiddleware("graphql:GraphQLKoaMiddleware")
    );
  }
}
```

## License

MIT
