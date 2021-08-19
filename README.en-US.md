# apollo-server-midway

English | [简体中文](./README.md)

## 🎉 Announcing V 1.0

You can now happily integrate [Apollo-Server](https://www.apollographql.com/docs/apollo-server) and [TypeGraphQL](https://github.com/MichalLytek/type-graphql) with [Midway Serverless](https://www.yuque.com/midwayjs/midway_v2/serverless_introduction).

- Support most serverless configurations of `Apollo Server` and `TypeGraphQL`.
- Support `Serverless` application by using `Apollo-Server` as interpreter and traditional Node application in a way of using `Apollo-Server` as middlware, `Koa` solution is available now.
- Built-in out-of-the-box plugins. e.g. [Query Complexity](packages/apollo-query-complexity), [Resolve Time](packages/apollo-resolve-time), etc.
- Integrate with debug ability of `Midway Container`.(e.g. retrieving context and `GraphQL Schema` from `GraphQLResponse#extensions`)
- Based on [Apollo Server V3](https://www.apollographql.com/docs/apollo-server/migration/), `Apollo Sandbox` is disabled by default, try `GraphQL Playground` instead.
- Unit test coverage more than 90%.

To get started，you could try [experimental-midway-sls-graphql](https://github.com/linbudu599/experimental-midway-sls-graphql) and [sample](packages/sample/src/function/hello.ts) to get a glance at basic usage.

> API Documentation is on its way 🐎...
>
> See [types.ts](packages/apollo-server-midway/lib/shared/types.ts) and [preset-options.ts](packages/apollo-server-midway/lib/shared/preset-option.ts) to check on supported options (Apollo、TypeGraphQL、Built-In Plugin)。

## Quick Start

### Apollo-Server + Midway Serverless

Use [apollo-server-midway](packages/apollo-server-midway) in Serverless:

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

In the example above, function `apollo-handler` will be deployed to `SLS_DOMAIN/SERVICE/apollo-handler`. You can invoke it by visiting `SLS_DOMAIN/SERVICE/apollo-handler/`. (Note: the tailing slash `/` is needed).

### Apollo-Server + Midway Node Application (Not Stable!)

Use [apollo-server-midway](packages/apollo-server-midway/lib/app/graphql-middleware.ts) in traditional Node app:

Refer to [koa-app-sample](packages/koa-app-sample) for more details.

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
