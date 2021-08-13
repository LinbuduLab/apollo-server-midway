# apollo-server-midway

Apllo-Server integration for Midway Serverless, have fun!

**Un published yet**

This project is still under heavy development, the interface exposed may got breaking change at any time.
So donot use this project yet, for example of Apollo-Server + Midway Serverless, see [experimental-midway-sls-graphql](https://github.com/linbudu599/experimental-midway-sls-graphql).

## Quick Start

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
      ...this.ctx,
    });
  }
}
```
