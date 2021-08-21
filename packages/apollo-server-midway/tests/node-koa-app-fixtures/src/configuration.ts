import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import * as GraphQL from '../../../lib';

@Configuration({
  imports: [GraphQL],
  importConfigs: ['./config'],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayKoaApplication;

  async onReady(): Promise<void> {
    this.app.use(
      await this.app.generateMiddleware('graphql:GraphQLKoaMiddleware')
    );
  }

  async onStop(): Promise<void> {}
}
