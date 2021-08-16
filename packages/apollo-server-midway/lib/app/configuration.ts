import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';

@Configuration({
  imports: [],
  importConfigs: ['./config'],
  namespace: 'graphql',
})
export class GraphQLConfiguration implements ILifeCycle {
  // @App()
  // app: IMidwayKoaApplication;

  async onReady(): Promise<void> {
    // this.app.use(
    //   await this.app.generateMiddleware('graphql:GraphQLKoaMiddleware')
    // );
  }

  async onStop(): Promise<void> {}
}
