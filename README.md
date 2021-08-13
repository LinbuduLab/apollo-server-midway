# apollo-server-midway
Apllo-Server integration for Midway Serverless, have fun!

**Un published yet**

## Quick Start

```typescript
import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessFunction,
  ServerlessTriggerType,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';
import { createApolloHandler } from 'apollo-server-midway';

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @ServerlessFunction({
    functionName: 'apollo',
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: "/graphql",
    method: 'get',
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: "/graphql",
    method: 'post',
  })
  async apolloMidwayHandler() {
    return await createApolloHandler({
      path: "/graphql",
      ...this.ctx,
    });
  }
}


```
