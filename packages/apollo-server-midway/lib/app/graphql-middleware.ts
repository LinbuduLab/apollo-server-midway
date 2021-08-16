import path from 'path';
import { Provide, Config, App } from '@midwayjs/decorator';
import {
  IWebMiddleware as KoaMiddleware,
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaNext,
} from '@midwayjs/koa';
import {
  Middleware as ExpressMiddleware,
  Application as IMidwayExpressApplication,
  Context as IMidwayExpressContext,
} from '@midwayjs/express';
import {
  MidwayWebMiddleware as EggMiddleware,
  Application as IMidwayEggApplication,
  Context as IMidwayEggContext,
} from '@midwayjs/web';

import {
  ApolloServer,
  ServerRegistration,
  Config as ApolloServerConfig,
} from 'apollo-server-koa';
import { buildSchemaSync, BuildSchemaOptions } from 'type-graphql';

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { playgroundDefaultSettings } from '../shared/constants';
import { GraphQLSchema } from 'graphql';

const presetConfig: Omit<ServerRegistration, 'app'> = {};

// TODO: 找到共享泛型
export const sharedInitGraphQLSchema = (
  app: IMidwayKoaApplication,
  options?: BuildSchemaOptions
) => {
  const container = app.getApplicationContext();

  const schema = buildSchemaSync({
    resolvers: [path.resolve(app.getBaseDir(), 'resolvers/*')],
    container,
    authMode: 'error',
    emitSchemaFile: 'schema.graphql',
  });

  return schema;
};

export const sharedInitApolloServer = (
  app: IMidwayKoaApplication,
  schema: GraphQLSchema,
  config?: ApolloServerConfig,
  registration?: ServerRegistration
): ApolloServer => {
  const container = app.getApplicationContext();

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

  return server;
};

@Provide('GraphQLKoaMiddleware')
export class GraphQLKoaMiddleware implements KoaMiddleware {
  @Config('graphql')
  externalconfig: ServerRegistration;

  @App()
  app: IMidwayKoaApplication;

  resolve() {
    return async (ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      console.log(this.externalconfig);
      const schema = sharedInitGraphQLSchema(this.app);

      const server = sharedInitApolloServer(this.app, schema);
      await server.start();

      server.applyMiddleware({
        app: this.app,
        ...this.externalconfig,
      });

      await next();
    };
  }
}
