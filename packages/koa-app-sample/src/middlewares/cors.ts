import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware } from '@midwayjs/koa';

import cors from '@koa/cors';

@Provide('CORSMiddleware')
export default class CORSMiddleware implements IWebMiddleware {
  resolve() {
    return cors({ origin: '*', allowMethods: '*', allowHeaders: '*' });
  }
}
