# apollo-server-midway

## Towards apollo-server-midway V1.0

- [x] Support for plain NodeJS application based on MidwayJS framework(Koa / Express).
- [x] Support built-in plugins for out-of-box usage.
- [x] Support Vercel as provider.
- [x] Extension based function debug.
- [x] Apollo-Server / TypeGraphQL config normalization.
- [x] Schema as response.
- [x] Support Apollo DataSource.
- [x] Support Health-Checks (Also as resolver).
- [x] Apollo v3 introspection compatibility(enable GraphQL Playground in prod).
- [x] Request/Response headers adjustments.
- [x] Unit Tests.
- [ ] Better options normalization.
- [x] Better `Debug` support.
- [x] Function path in custom domain
- [x] Better node application support.

## Future

- [ ] Custom decorators.
- [ ] Built-in support for TypeORM / Prisma + TypeGraphQL application.

**This project is still under heavy development, the interface exposed may got breaking change at any time.**

**Therefore it's not production-ready yet, if you're searching for usage example of Apollo-Server with Midway Serverless, see repo [experimental-midway-sls-graphql](https://github.com/linbudu599/experimental-midway-sls-graphql) or package [sample](packages/sample/src/function/hello.ts) for more information.**

## Quick Start

### Apollo-Server + Midway Serverless

Using [apollo-server-midway](packages/apollo-server-midway/README.md) for Midway Serverless development(Use Apollo-Server as serverless request / response handler).

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
import { experimentalCreateHandler } from "apollo-server-midway";
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
    return await experimentalCreateHandler({
      path: "/",
      app: this.app,
      context: this.ctx,
      // NOTE: schema is required, either schema.resolvers or apollp.schema should be specified.
      schema: {
        resolvers: [path.resolve(this.app.getBaseDir(), "resolvers/*")],
      },
    });
  }
}
```

See [types.ts](packages/apollo-server-midway/lib/shared/types.ts) and [preset-options.ts](packages/apollo-server-midway/lib/shared/preset-option.ts) for supported options including **built-in options** & **Apollo Server config** & **TypeGraphQL `buildSchemaSync` options.**

As sample aboce, faas function `apollo` will be deployed with endpoint located at `SLS_DOMAIN/SERVICE/apollo/`.

### Apollo-Server + Midway Node Application(Not Stable!)

Using [apollo-server-midway](packages/apollo-server-midway/README.md) for Midway plain node application development(Use Apollo-Server as `Koa`/`Express` middleware).

see [koa-app-sample](packages/koa-app-sample) for more info.

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

See [types.ts](packages/apollo-server-midway/lib/shared/types.ts) and [preset-options.ts](packages/apollo-server-midway/lib/shared/preset-option.ts) for supported options including **built-in options** & **Apollo Server config** & **TypeGraphQL `buildSchemaSync` options.**

### Midway-FaaS-GraphQL + Midway Serverless(Not Stable!)

```bash
npm install midway-faas-graphql --save
yarn add midway-faas-graphql --save
pnpm install midway-faas-graphql --save
```

Using [midway-faas-graphql](packages/apollo-server-midway/README.md) for Midway Serverless development(Use official GraphQL package to handle request / response).

```typescript
// functions
import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessFunction,
  ServerlessTriggerType,
  ALL,
  Query,
  Config,
} from "@midwayjs/decorator";
import { Context } from "@midwayjs/faas";
import { experimentalCreateHandler } from "apollo-server-midway";
import {
  GraphQLService,
  PluginConfig,
  RenderPlaygroundQueryOptions,
} from "midway-faas-graphql";

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @Inject("graphql:GraphQLService")
  graphql: GraphQLService;

  @Config()
  faasGraphQLConfig: PluginConfig;

  @ServerlessFunction({
    functionName: "graphql",
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: "/graphql",
    method: "get",
  })
  async graphqlPlaygroundHandler(
    @Query(ALL) playgroundOptions: RenderPlaygroundQueryOptions
  ) {
    return await this.graphql.playground(this.ctx, playgroundOptions);
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: "/graphql",
    method: "post",
  })
  async graphqlHandler() {
    return this.graphql.handler(this.ctx, this.faasGraphQLConfig);
  }
}

// configuration.ts
import { Configuration } from "@midwayjs/decorator";
import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from "@midwayjs/core";
import path from "path";
import * as graphql from "midway-faas-graphql";

@Configuration({
  imports: [graphql],
  importConfigs: [path.join(__dirname, "./config")],
})
export class ContainerLifeCycle implements ILifeCycle {
  async onReady(container: IMidwayContainer, app: IMidwayApplication) {}
}
```

Function `graphql` will be deployed, endpoint located at `SLS_DOMAIN/SERVICE/graphql/graphql`.

If you prefer index handler, just modify `path` in `@ServerlessTrigger`.
