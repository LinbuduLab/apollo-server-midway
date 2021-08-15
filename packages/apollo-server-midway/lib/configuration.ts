import path from 'path';
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';

@Configuration({
  imports: [],
  importConfigs: ['./config'],
})
export class GraphQLConfiguration implements ILifeCycle {
  @App()
  app: IMidwayKoaApplication;

  async onReady(): Promise<void> {
    this.app.use(await this.app.generateMiddleware('GraphQLMiddleware'));
  }

  async onStop(): Promise<void> {}
}
