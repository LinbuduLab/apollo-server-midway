import { Configuration } from '@midwayjs/decorator';
import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import { join } from 'path';
import { GraphQLService } from './lib/core';

@Configuration({
  importConfigs: [join(__dirname, 'config')],
  namespace: 'graphql',
})
export class ContainerLifeCycle implements ILifeCycle {
  async onReady(container: IMidwayContainer, app: IMidwayApplication) {
    const config = container
      .getConfigService()
      .getConfiguration('faasGraphQLConfig');
    const graphql = new GraphQLService(container, config);

    container.registerObject('graphql', graphql);
  }
}
