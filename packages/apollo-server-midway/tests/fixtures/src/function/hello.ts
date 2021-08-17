import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessTriggerType,
  App,
} from '@midwayjs/decorator';
import { Context, IMidwayFaaSApplication } from '@midwayjs/faas';
import { experimentalCreateHandler } from '../../../../lib';
import path from 'path';

export const PLAIN_USAGE_FUNC_PATH = '/plain';
export const PLUGIN_ENABLED_FUNC_PATH = '/plugin';
export const USE_APOLLO_SCHEMA_FUNC_PATH = '/apollo';
export const FULL_CONFIGURED_FUNC_PATH = '/full';

@Provide()
export class HelloHTTPService {
  @Inject()
  ctx: Context;

  @App()
  app: IMidwayFaaSApplication;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/',
    method: 'get',
  })
  async IndexHandler() {
    return 'Hello Index!';
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: PLAIN_USAGE_FUNC_PATH,
    method: 'get',
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: PLAIN_USAGE_FUNC_PATH,
    method: 'post',
  })
  async PlainUsage() {
    return await experimentalCreateHandler({
      path: '/',
      context: this.ctx,
      schema: {
        resolvers: [path.resolve(this.app.getBaseDir(), 'resolvers/*')],
      },
      apollo: {
        introspection: true,
      },
    });
  }
}
