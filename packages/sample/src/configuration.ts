import { Configuration, listModule, App } from '@midwayjs/decorator';
import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import { join } from 'path';
import * as graphql from 'midway-faas-graphql';

@Configuration({
  imports: ['midway-faas-graphql'],
  importConfigs: [join(__dirname, './config')],
  // conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {
  async onReady(container: IMidwayContainer, app: IMidwayApplication) {
    // console.log(await container.getAsync('graphql'));
  }
}
