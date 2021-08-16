import path from 'path';
import { Provide, Config, App } from '@midwayjs/decorator';
import {
  IWebMiddleware,
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaNext,
} from '@midwayjs/koa';

import { ApolloServer, ServerRegistration } from 'apollo-server-koa';
import { buildSchemaSync } from 'type-graphql';

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { playgroundDefaultSettings } from '../shared/constants';

const presetConfig: Omit<ServerRegistration, 'app'> = {};

@Provide('GraphQLKoaMiddleware')
export class GraphQLKoaMiddleware implements IWebMiddleware {
  // @Config('internal')
  // config: ServerRegistration;

  @Config('graphql')
  externalconfig: ServerRegistration;

  @App()
  app: IMidwayKoaApplication;

  resolve() {
    return async (_ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      // console.log(this.config);
      console.log(this.externalconfig);
      const container = this.app.getApplicationContext();
      const schema = buildSchemaSync({
        resolvers: [path.resolve(this.app.getBaseDir(), 'resolvers/*')],
        container,
        authMode: 'error',
        emitSchemaFile: 'schema.graphql',
      });

      const server = new ApolloServer({
        schema,
        context: {
          container,
        },
        plugins: [
          ['production'].includes(process.env.NODE_ENV) ||
          process.env.DISABLE_PLAYGROUND
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageGraphQLPlayground({
                settings: playgroundDefaultSettings,
              }),
        ],
      });
      await server.start();

      console.log('Apollo-GraphQL Start');

      server.applyMiddleware({
        app: this.app,
        ...this.externalconfig,
      });

      await next();
    };
  }
}
