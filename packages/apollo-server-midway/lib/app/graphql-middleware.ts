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

import ApolloResolveTimePlugin from 'apollo-resolve-time';
import ApolloQueryComplexityPlugin from 'apollo-query-complexity';

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
  presetBuiltInPluginOption,
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
  ctx: IMidwayKoaContext | IMidwayExpressContext,
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
  ctx: IMidwayKoaContext,
  app: IMidwayKoaApplication,
  schema: GraphQLSchema,
  config?: ApolloServerKoaConfig,
  pluginConfig?: BuiltInPluginConfiguration,
  extraConfig?: { prodPlaygound?: boolean; appendApplicationContext?: boolean }
): ApolloServerKoa {
  const merged = merge(
    presetApolloOption,
    config,
    {
      builtInPlugins: merge(presetBuiltInPluginOption, pluginConfig),
    },
    extraConfig
  );

  const {
    context: userGraphQLContext,
    dataSources,
    mocks,
    mockEntireSchema,
    introspection,
    persistedQueries,
    plugins,
    builtInPlugins: { resolveTime, queryComplexity },
    prodPlaygound,
    appendApplicationContext,
  } = merged;

  const server = new ApolloServerKoa({
    schema,
    persistedQueries,
    context: appendApplicationContext
      ? {
          ...userGraphQLContext,
          appContext: ctx,
          container: app.getApplicationContext(),
        }
      : userGraphQLContext,
    plugins: [
      prodPlaygound
        ? ApolloServerPluginLandingPageGraphQLPlayground({
            settings: playgroundDefaultSettings,
          })
        : process.env.NODE_ENV !== 'production'
        ? ApolloServerPluginLandingPageGraphQLPlayground({
            settings: playgroundDefaultSettings,
          })
        : ApolloServerPluginLandingPageDisabled(),
      resolveTime.enable && ApolloResolveTimePlugin(),
      queryComplexity.enable &&
        ApolloQueryComplexityPlugin(
          schema,
          queryComplexity.maxComlexity,
          queryComplexity.throwOnMaximum
        ),
      ...plugins,
    ].filter(Boolean),
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

  resolve() {
    return async (ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const {
        apollo,
        schema: buildSchemaOptions,
        path = '/graphql',
        prodPlaygound = false,
        appendApplicationContext = true,
        builtInPlugins,
        cors,
        bodyParserConfig,
      } = this.externalconfig;

      const schema =
        apollo?.schema ??
        sharedInitGraphQLSchema(ctx, this.app, buildSchemaOptions);

      const server = initKoaApolloServer(
        ctx,
        this.app,
        schema,
        apollo,
        builtInPlugins,
        { prodPlaygound, appendApplicationContext }
      );
      await server.start();

      server.applyMiddleware({
        app: this.app,
        path,
        cors,
        bodyParserConfig,
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
      // const schema = sharedInitGraphQLSchema(ctx, this.app);
      // const server = initExpressApolloServer(this.app, schema);
      // server.applyMiddleware({
      //   app: this.app,
      //   path: '/graphql',
      //   ...this.externalconfig,
      // });
    };
  }
}
