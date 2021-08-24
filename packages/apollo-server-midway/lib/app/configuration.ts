import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
@Configuration({
  imports: [],
  importConfigs: ['./config'],
  namespace: 'graphql',
})
export class GraphQLConfiguration implements ILifeCycle {
  async onReady(): Promise<void> {}

  async onStop(): Promise<void> {}
}
