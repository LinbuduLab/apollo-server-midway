import { App, Configuration } from '@midwayjs/decorator';
import { Application } from '@midwayjs/express';
import * as GraphQL from 'apollo-server-midway';

@Configuration({
  imports: [GraphQL],
  conflictCheck: true,
})
export class ContainerLifeCycle {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      await this.app.generateMiddleware('graphql:GraphQLExpressMiddleware')
    );
  }
}
