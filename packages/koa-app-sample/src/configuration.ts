import path from 'path';
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import dotenv from 'dotenv';

const envFilesPath = ['development', 'local'].includes(process.env.NODE_ENV)
  ? path.resolve(process.cwd(), '.env')
  : path.resolve(process.cwd(), '.env.prod');

dotenv.config({
  path: envFilesPath,
});

@Configuration({
  imports: [],
  importConfigs: ['./config'],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayKoaApplication;

  async onReady(): Promise<void> {
    this.app.use(await this.app.generateMiddleware('GraphQLMiddleware'));
  }

  async onStop(): Promise<void> {}
}
