# apollo-server-midway

Apllo-Server integration for Midway Serverless, have fun!

**Un published yet**

This project is still under heavy development, the interface exposed may got breaking change at any time.
So donot use this project yet, for example of Apollo-Server + Midway Serverless, see repo [experimental-midway-sls-graphql](https://github.com/linbudu599/experimental-midway-sls-graphql) or package [sample](packages/sample/src/function/hello.ts) for more information.

## Quick Start

Use [apollo-server-midway](packages/apollo-server-midway/README.md):

```typescript
import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessFunction,
  ServerlessTriggerType,
} from "@midwayjs/decorator";
import { Context } from "@midwayjs/faas";
import { createApolloHandler } from "apollo-server-midway";

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @ServerlessFunction({
    functionName: "apollo",
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: "/graphql",
    method: "get",
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: "/graphql",
    method: "post",
  })
  async apolloMidwayHandler() {
    return await createApolloHandler({
      path: "/graphql",
      context: this.ctx,
    });
  }
}
```

Use [midway-faas-graphql](packages/apollo-server-midway/README.md):

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
import { GraphQLService, PluginConfig } from "midway-faas-graphql";
import { RenderPlaygroundQueryOptions } from "../typing";

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

## Main Packages & Todo

### apollo-server-midway

- [ ] [Feature] Support for plain NodeJS application based on MidwayJS framework(currently only Midway Serverless is supported).
- [ ] [Feature] Support built-in plugins for out-of-box usage.
- [ ] [Feature] Support Vercel as provider.
- [ ] [Feature] Extension based function debug.
- [ ] [Feature] Apollo-Server / TypeGraphQL config normalization.
- [ ] [Feature] Custom decorators.
- [ ] [Feature] Schema / Voyager as response.
- [ ] [Fix] Apollo v3 introspection compatibility(enable GraphQL Playground in prod).
- [ ] [Fix] Request/Response headers adjustments.
- [ ] [Test] Unit Tests.

### midway-faas-graphql

- [ ] [Feature] Configuration.
- [ ] [Fix] Incorrect config loading behaviour.
