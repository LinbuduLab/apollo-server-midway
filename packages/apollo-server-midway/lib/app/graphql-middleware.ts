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
  IMidwayExpressApplication,
  IMidwayExpressContext,
} from '@midwayjs/express';
import { Request, Response } from 'express';

import {
  ApolloServer as ApolloServerKoa,
  Config as ApolloServerKoaConfig,
} from 'apollo-server-koa';
import {
  ApolloServer as ApolloServerExpress,
  Config as ApolloServerExpressConfig,
} from 'apollo-server-express';

import ApolloResolveTimePlugin from 'apollo-resolve-time';
import ApolloQueryComplexityPlugin from 'apollo-query-complexity';

import { buildSchemaSync } from 'type-graphql';

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { playgroundDefaultSettings } from '../shared/constants';
import {
  presetApolloOption,
  presetBuiltInPluginOption,
  presetOption,
} from '../shared/preset-option';
import {
  BuiltInPluginConfiguration,
  CreateGraphQLMiddlewareOption,
  CreateKoaGraphQLMiddlewareOption,
  CreateExpressGraphQLMiddlewareOption,
} from '../shared/types';
import merge from 'lodash/merge';
import { getFallbackResolverPath } from '../shared/utils';
import { NextFunction } from 'express';

export const sharedInitGraphQLSchema = (
  app: IMidwayKoaApplication | IMidwayExpressApplication,
  options: CreateGraphQLMiddlewareOption['schema']
) => {
  const {
    resolvers = getFallbackResolverPath(app),
    authMode,
    authChecker,
    dateScalarMode,
    nullableByDefault,
    skipCheck,
    globalMiddlewares,
    emitSchemaFile,
  } = options;

  const schema = buildSchemaSync({
    resolvers,
    dateScalarMode,
    nullableByDefault,
    skipCheck,
    globalMiddlewares,
    authMode,
    authChecker,
    emitSchemaFile,
    container: app.getApplicationContext(),
  });

  return schema;
};

const getPresetPluginList = (
  { resolveTime, queryComplexity }: BuiltInPluginConfiguration,
  prodPlaygound: boolean,
  schema: GraphQLSchema
) => {
  const plugins = [
    prodPlaygound || process.env.NODE_ENV !== 'production'
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
  ].filter(Boolean);

  return plugins;
};

// TODO: extract shared
export function initExpressApolloServer(
  app: IMidwayExpressApplication,
  schema: GraphQLSchema,
  config: ApolloServerExpressConfig,
  pluginConfig: BuiltInPluginConfiguration,
  extraConfig: { prodPlaygound?: boolean; appendApplicationContext?: boolean }
): ApolloServerExpress {
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
    builtInPlugins,
    prodPlaygound,
    appendApplicationContext,
  } = merged;

  const server = new ApolloServerExpress({
    schema,
    persistedQueries,
    context: appendApplicationContext
      ? {
          ...userGraphQLContext,
          container: app.getApplicationContext(),
        }
      : userGraphQLContext,
    plugins: [
      ...getPresetPluginList(builtInPlugins, prodPlaygound, schema),
      ...plugins,
    ],
    dataSources,
    mocks,
    mockEntireSchema,
    introspection,
  });

  return server;
}

export function initKoaApolloServer(
  ctx: IMidwayKoaContext,
  app: IMidwayKoaApplication,
  schema: GraphQLSchema,
  config: ApolloServerKoaConfig,
  pluginConfig: BuiltInPluginConfiguration,
  extraConfig: { prodPlaygound?: boolean; appendApplicationContext?: boolean }
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
    builtInPlugins,
    prodPlaygound,
    appendApplicationContext,
  } = merged;

  const server = new ApolloServerKoa({
    schema,
    persistedQueries,
    context: appendApplicationContext
      ? ({ ctx }: { ctx: IMidwayKoaContext }) => {
          return {
            ...userGraphQLContext,
            appContext: ctx,
            container: app.getApplicationContext(),
          };
        }
      : userGraphQLContext,
    plugins: [
      ...getPresetPluginList(builtInPlugins, prodPlaygound, schema),
      ...plugins,
    ],
    dataSources,
    mocks,
    mockEntireSchema,
    introspection,
  });

  return server;
}

@Provide('GraphQLKoaMiddleware')
export class GraphQLKoaMiddleware implements KoaMiddleware {
  @Config('graphql')
  externalconfig: CreateKoaGraphQLMiddlewareOption;

  @App()
  app: IMidwayKoaApplication;

  resolve() {
    return async (ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const {
        apollo,
        schema: buildSchemaOptions,
        path,
        prodPlaygound,
        appendApplicationContext,
        builtInPlugins,
        cors,
        bodyParserConfig,
        disableHealthCheck,
        onHealthCheck = null,
      } = merge(presetOption, this.externalconfig);

      const schema =
        apollo?.schema ?? sharedInitGraphQLSchema(this.app, buildSchemaOptions);

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
        disableHealthCheck,
        onHealthCheck,
      });

      await next();
    };
  }
}

@Provide('GraphQLExpressMiddleware')
export class GraphQLExpressMiddleware implements ExpressMiddleware {
  @Config('graphql')
  externalconfig: CreateExpressGraphQLMiddlewareOption;

  @App()
  app: IMidwayExpressApplication;

  resolve() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const {
        apollo,
        schema: buildSchemaOptions,
        path,
        prodPlaygound,
        appendApplicationContext,
        builtInPlugins,
        cors,
        bodyParserConfig,
        disableHealthCheck,
        onHealthCheck = null,
      } = merge(presetOption, this.externalconfig);

      const schema =
        apollo?.schema ?? sharedInitGraphQLSchema(this.app, buildSchemaOptions);

      const server = initExpressApolloServer(
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
        bodyParserConfig,
        disableHealthCheck,
        onHealthCheck,
      });

      next();
    };
  }
}
