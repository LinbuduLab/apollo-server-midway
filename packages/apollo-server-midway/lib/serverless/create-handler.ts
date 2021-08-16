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

import { contextExtensionPlugin } from '../plugins/container-extension';
import { printSchemaExtensionPlugin } from '../plugins/print-graphql-schema';

import { CreateHandlerOption } from '../shared/types';
import { playgroundDefaultSettings } from '../shared/constants';

import { presetOption } from './preset';

export async function experimentalCreateHandler(option: CreateHandlerOption) {
  const {
    builtInPlugins: {
      resolveTime,
      queryComplexity,
      contextExtension,
      printSchema,
    },
    context,
    appendFaaSContext,
    apollo: { context: graphQLContext, dataSources },
  } = merge(presetOption, option);

  const resolverPath = option?.schema?.resolvers ?? [
    path.resolve(__dirname, '../resolver/*'),
    path.resolve(__dirname, '../resolvers/*'),
  ];

  const mergedMiddlewares = [
    // ...built-in middlware
    ...(option?.schema?.globalMiddlewares ?? []),
  ];

  const schema = buildSchemaSync({
    // FIXME: 不指定也能解析到？这是什么玄学
    resolvers: resolverPath,
    dateScalarMode: 'timestamp',
    nullableByDefault: false,
    skipCheck: false,
    ...option.schema,
    globalMiddlewares: mergedMiddlewares,
  });

  const server = new ApolloServerMidway({
    schema,
    dataSources,
    context: appendFaaSContext
      ? {
          ...context,
          ...graphQLContext,
        }
      : graphQLContext,
    plugins: [
      option.prodPlaygound
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
    path: option.path,
    context: option.context,
  });
}
