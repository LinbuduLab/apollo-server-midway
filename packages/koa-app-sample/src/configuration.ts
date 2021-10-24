import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import * as GraphQL from 'apollo-server-midway';

@Configuration({
  imports: [GraphQL],
  importConfigs: ['./config'],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayKoaApplication;

  async onReady(container: IMidwayContainer): Promise<void> {
    container.registerObject('foo', 'bar');
    this.app.use(
      // await this.app.generateMiddleware('graphql:GraphQLKoaMiddleware')
      await this.app.generateMiddleware('extend:GraphQLKoaMiddleware')
    );
  }

  async onStop(): Promise<void> {}
}
