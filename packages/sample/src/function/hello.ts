import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessFunction,
  ServerlessTriggerType,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

import { experimentalCreateHandler } from 'apollo-server-midway';

const apolloHandlerFuncName = 'apollo-handler';

const APOLLO_SERVER_MIDWAY_PATH = '/apollo';

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @ServerlessFunction({
    functionName: apolloHandlerFuncName,
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: APOLLO_SERVER_MIDWAY_PATH,
    method: 'get',
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: APOLLO_SERVER_MIDWAY_PATH,
    method: 'post',
  })
  async apolloHandler() {
    return await experimentalCreateHandler({
      path: '/apollo',
      context: this.ctx,
    });
  }
}
