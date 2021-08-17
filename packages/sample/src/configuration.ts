import { Configuration } from '@midwayjs/decorator';
import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core';
import path from 'path';
import * as graphql from 'midway-faas-graphql';

@Configuration({
  imports: [graphql],
  importConfigs: [path.join(__dirname, './config')],
})
export class ContainerLifeCycle implements ILifeCycle {
  async onReady(container: IMidwayContainer, app: IMidwayApplication) {}
}
