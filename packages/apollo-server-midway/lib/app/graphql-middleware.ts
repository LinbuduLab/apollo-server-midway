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
  IMidwayExpressContext,
} from '@midwayjs/express';
import { Request, Response } from 'express';

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
import { GraphQLSchema } from 'graphql';
import { playgroundDefaultSettings } from '../shared/constants';
import {
  presetApolloOption,
  presetBuildSchemaOption,
  presetOption,
} from '../shared/preset-option';
import {
  UsableBuildSchemaOption,
  UsableApolloOption,
  BuiltInPluginConfiguration,
  CreateGraphQLMiddlewareOption,
} from '../shared/types';
import merge from 'lodash/merge';
import { getFallbackResolverPath } from '../shared/utils';

export const sharedInitGraphQLSchema = (
  app: IMidwayKoaApplication | IMidwayExpressApplication,
  options?: UsableBuildSchemaOption & {
    emitSchemaFile?: boolean;
    useContainer?: boolean;
  }
) => {
  const {
    resolvers = getFallbackResolverPath(app),
    authMode,
    authChecker,
    dateScalarMode,
    nullableByDefault,
    skipCheck,
    globalMiddlewares,
    emitSchemaFile = 'schema.graphql',
    useContainer = true,
  } = merge(presetBuildSchemaOption, options);

  const container = app.getApplicationContext();

  const schema = buildSchemaSync({
    resolvers,
    dateScalarMode,
    nullableByDefault,
    skipCheck,
    globalMiddlewares,
    authMode,
    authChecker,
    emitSchemaFile,
    // TODO: getter
    container: useContainer ? container : undefined,
  });

  return schema;
};

export function initKoaApolloServer(
  app: IMidwayKoaApplication,
  schema: GraphQLSchema,
  config?: ApolloServerKoaConfig
): ApolloServerKoa {
  const {
    context: userGraphQLContext,
    dataSources,
    mocks,
    mockEntireSchema,
    introspection,
  } = merge(presetApolloOption, config);

  const server = new ApolloServerKoa({
    schema,
    context: userGraphQLContext,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: playgroundDefaultSettings,
      }),
    ],
    dataSources,
    mocks,
    mockEntireSchema,
    introspection,
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
  externalconfig: CreateGraphQLMiddlewareOption;

  @App()
  app: IMidwayKoaApplication;

  // TODO: cors、bodyParser
  // TODO: cache ?

  resolve() {
    return async (ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const {
        apollo,
        schema: buildSchemaOptions,
        path = '/graphql',
        prodPlaygound,
      } = this.externalconfig;

      const schema =
        apollo?.schema ?? sharedInitGraphQLSchema(this.app, buildSchemaOptions);

      const server = initKoaApolloServer(this.app, schema, apollo);
      await server.start();

      server.applyMiddleware({
        app: this.app,
        path,
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
