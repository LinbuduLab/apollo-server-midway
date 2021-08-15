import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import path from 'path';
import { printSchema, lexicographicSortSchema } from 'graphql';
import { buildSchemaSync } from 'type-graphql';
import { CreateHandlerOption } from './types';
import { playgroundDefaultSettings } from './constants';
import { ApolloServerMidway } from './apollo-server-midway';
import ApolloResolveTimePlugin from 'apollo-resolve-time';
import ApolloQueryComplexityPlugin from 'apollo-query-complexity';
import merge from 'lodash/merge';
import { contextExtensionPlugin } from './container-extension';
import { printSchemaExtensionPlugin } from './print-graphql-schema';

const presetOption: Omit<CreateHandlerOption, 'context'> = {
  path: '/graphql',
  prodPlaygound: false,
  builtInPlugins: {
    // TODO: control by environment variables
    resolveTime: {
      enable: true,
    },
    queryComplexity: {
      enable: true,
    },
    contextExtension: {
      enable: false,
    },
    printSchema: {
      enable: false,
      sort: true,
    },
  },
  apollo: {},
  schema: {
    resolvers: ['SKIP_NON_EMPTY_ARRAY_CHECK'],
  },
};

export async function experimentalCreateHandler(option: CreateHandlerOption) {
  const {
    builtInPlugins: {
      resolveTime,
      queryComplexity,
      contextExtension,
      printSchema,
    },
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
    plugins: [
      // Auto disabled inside sls container?
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
