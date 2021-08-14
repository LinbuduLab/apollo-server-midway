import { Configuration } from '@midwayjs/decorator';
import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import { join } from 'path';
import { GraphQLService } from './lib/core';

@Configuration({
  importConfigs: [join(__dirname, './config/')],
  conflictCheck: true,
  namespace: 'graphql',
})
export class ContainerLifeCycle implements ILifeCycle {
  async onReady(container: IMidwayContainer, app: IMidwayApplication) {
    const graphql = new GraphQLService(container, app);
    console.log('register');
    container.registerObject('graphql', graphql);
  }
}
