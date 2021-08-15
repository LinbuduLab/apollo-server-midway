# apollo-server-midway

**This project is still under heavy development, the interface exposed may got breaking change at any time.
So donot use this project yet, for example of Apollo-Server + Midway Serverless, see repo [experimental-midway-sls-graphql](https://github.com/linbudu599/experimental-midway-sls-graphql) or package [sample](packages/sample/src/function/hello.ts) for more information.**

## Quick Start

Using [apollo-server-midway](packages/apollo-server-midway/README.md):

> **Midway Serverless Only!**

Use Apollo-Server as serverless request / response handler.

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
      path: "/apollo",
      app: this.app,
      context: this.ctx,
      schema: {
        resolvers: [path.resolve(this.app.getBaseDir(), "resolvers/*")],
      },
    });
  }
}
```

Function `apollo` will be deployed, endpoint located at `SLS_DOMAIN/SERVICE/apollo/graphql`.

Using [midway-faas-graphql](packages/apollo-server-midway/README.md):

Use official GraphQL package to handle request / response.

```typescript
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
```

Function `graphql` will be deployed, endpoint located at `SLS_DOMAIN/SERVICE/graphql/graphql`.

If you prefer index handler, just modify `path` in `@ServerlessTrigger`.

## Main Packages & Todo

### apollo-server-midway

- [ ] [Feature] Support for plain NodeJS application based on MidwayJS framework(currently only Midway Serverless is supported).
- [x] [Feature] Support built-in plugins for out-of-box usage.
- [ ] [Feature] Support Vercel as provider.
- [x] [Feature] Extension based function debug.
- [x] [Feature] Apollo-Server / TypeGraphQL config normalization.
- [ ] [Feature] Custom decorators.
- [x] [Feature] Schema as response.
- [x] [Feature] Support Apollo DataSource.
- [ ] [Feature] Support Health-Checks.
- [x] [Fix] Apollo v3 introspection compatibility(enable GraphQL Playground in prod).
- [x] [Fix] Request/Response headers adjustments.
- [ ] [Test] Unit Tests.

### midway-faas-graphql

- [ ] [Feature] Configuration.
- [ ] [Fix] Incorrect config loading behaviour.
