import path from 'path';
import { Provide, Config, App } from '@midwayjs/decorator';
import {
  IWebMiddleware as KoaMiddleware,
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaNext,
} from '@midwayjs/koa';
import {
  IWebMiddleware as ExpressMiddleware,
  IMidwayExpressApplication as IMidwayExpressApplication,
  IMidwayExpressContext as IMidwayExpressContext,
} from '@midwayjs/express';
import { Request, Response } from 'express';

// import {
//   MidwayWebMiddleware as EggMiddleware,
//   Application as IMidwayEggApplication,
//   Context as IMidwayEggContext,
// } from '@midwayjs/web';

import {
  ApolloServer as ApolloServerKoa,
  ServerRegistration as KoaServerRegistration,
  Config as ApolloServerKoaConfig,
} from 'apollo-server-koa';
import {
  ApolloServer as ApolloServerExpress,
  ServerRegistration as ExpressServerRegistration,
  Config as ApolloServerExpressConfig,
} from 'apollo-server-express';

import { buildSchemaSync, BuildSchemaOptions } from 'type-graphql';

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { playgroundDefaultSettings } from '../shared/constants';
import { GraphQLSchema } from 'graphql';

export const sharedInitGraphQLSchema = (
  app: IMidwayKoaApplication | IMidwayExpressApplication,
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

export function initKoaApolloServer(
  app: IMidwayKoaApplication,
  schema: GraphQLSchema,
  config?: ApolloServerKoaConfig
): ApolloServerKoa {
  const container = app.getApplicationContext();

  const server = new ApolloServerKoa({
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
}

export function initExpressApolloServer(
  app: IMidwayExpressApplication,
  schema: GraphQLSchema,
  config?: ApolloServerExpressConfig
): ApolloServerExpress {
  const container = app.getApplicationContext();

  const server = new ApolloServerExpress({
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
}

@Provide('GraphQLKoaMiddleware')
export class GraphQLKoaMiddleware implements KoaMiddleware {
  @Config('graphql')
  externalconfig: KoaServerRegistration;

  @App()
  app: IMidwayKoaApplication;

  resolve() {
    return async (ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const schema = sharedInitGraphQLSchema(this.app);
      const server = initKoaApolloServer(this.app, schema);
      await server.start();

      server.applyMiddleware({
        app: this.app,
        path: '/graphql',
        ...this.externalconfig,
      });

      await next();
    };
  }
}

@Provide('GraphQLExpressMiddleware')
export class GraphQLExpressMiddleware implements ExpressMiddleware {
  @Config('graphql')
  externalconfig: ExpressServerRegistration;

  @App()
  app: IMidwayExpressApplication;

  resolve() {
    return async (req: Request, res: Response) => {
      const schema = sharedInitGraphQLSchema(this.app);
      const server = initExpressApolloServer(this.app, schema);

      server.applyMiddleware({
        app: this.app,
        path: '/graphql',
        ...this.externalconfig,
      });
    };
  }
}
