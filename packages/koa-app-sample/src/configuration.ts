import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import * as GraphQL from 'apollo-server-midway';

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
    // this.app.use(await this.app.generateMiddleware('GraphQLMiddleware'));
    // this.app.use(await this.app.generateMiddleware('GraphQLMiddleware'));
  }

  async onStop(): Promise<void> {}
}
