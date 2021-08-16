import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import path from 'path';
import { buildSchemaSync } from 'type-graphql';
import ApolloResolveTimePlugin from 'apollo-resolve-time';
import ApolloQueryComplexityPlugin from 'apollo-query-complexity';
import merge from 'lodash/merge';

import { ApolloServerMidway } from './apollo-server-midway';
import { InternalResolver } from './internal-resolver';

import { contextExtensionPlugin } from '../plugins/container-extension';
import { printSchemaExtensionPlugin } from '../plugins/print-graphql-schema';

import { CreateHandlerOption } from '../shared/types';
import { playgroundDefaultSettings } from '../shared/constants';

import { presetOption } from './preset';
import { IMidwayFaaSApplication } from '@midwayjs/faas';

const getFallbackResolverPath = (app?: IMidwayFaaSApplication): string[] => {
  return app
    ? [
        path.resolve(app.getBaseDir(), 'resolver/*'),
        path.resolve(app.getBaseDir(), 'resolvers/*'),
      ]
    : [
        // assert it's located in src/functions/
        path.resolve(__dirname, '../resolver/*'),
        path.resolve(__dirname, '../resolvers/*'),
      ];
};

export async function experimentalCreateHandler(option: CreateHandlerOption) {
  const {
    context,
    app,
    path,
    appendFaaSContext,
    prodPlaygound,
    builtInPlugins: {
      resolveTime,
      queryComplexity,
      contextExtension,
      printSchema,
    },
    apollo: { context: graphQLContext, dataSources, mocks, mockEntireSchema },
    schema: { globalMiddlewares, dateScalarMode, nullableByDefault, skipCheck },
    disableHealthCheck,
    disableHealthResolver,

    onHealthCheck,
  } = merge(presetOption, option);

  const resolverPath =
    option?.schema?.resolvers ?? getFallbackResolverPath(app);

  const schema = buildSchemaSync({
    // FIXME: 不指定也能解析到？这是什么玄学
    // FIXME: 加载逻辑
    resolvers: [resolverPath].concat(
      disableHealthResolver ? [] : [InternalResolver]
    ),
    dateScalarMode,
    nullableByDefault,
    skipCheck,
    ...option.schema,
    globalMiddlewares,
    // not supported! will cause unexpected error.
    // container: app?.getApplicationContext() ?? undefined,
  });

  const server = new ApolloServerMidway({
    schema,
    dataSources,
    mocks,
    mockEntireSchema,
    introspection: prodPlaygound,
    context: appendFaaSContext
      ? {
          ...context,
          ...graphQLContext,
        }
      : graphQLContext,
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
      contextExtension.enable &&
        contextExtensionPlugin(option.context, option.app),
      printSchema.enable && printSchemaExtensionPlugin(schema, printSchema),
    ].filter(Boolean),
  });

  await server.start();
  return server.createHandler({
    path,
    context,
    disableHealthCheck,
    onHealthCheck,
  });
}
