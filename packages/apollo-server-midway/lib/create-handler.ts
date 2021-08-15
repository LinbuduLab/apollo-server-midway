import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import path from 'path';
import { buildSchemaSync } from 'type-graphql';
import { CreateHandlerOption } from './types';
import { playgroundDefaultSettings } from './constants';
import { ApolloServerMidway } from './apollo-server-midway';
import ApolloResolveTimePlugin from 'apollo-resolve-time';
import ApolloQueryComplexityPlugin from 'apollo-query-complexity';
import merge from 'lodash/merge';
import { containerExtensionPlugin } from './container-extension';

const presetOption: Omit<CreateHandlerOption, 'context'> = {
  path: '/graphql',
  builtInPlugins: {
    resolveTime: {
      enable: true,
    },
    queryComplexity: {
      enable: true,
    },
    contextExtension: {
      enable: false,
    },
  },
  apollo: {},
  schema: {
    resolvers: ['SKIP_NON_EMPTY_ARRAY_CHECK'],
  },
};

export async function experimentalCreateHandler(option: CreateHandlerOption) {
  const {
    builtInPlugins: { resolveTime, queryComplexity, contextExtension },
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
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: playgroundDefaultSettings,
      }),
      resolveTime.enable && ApolloResolveTimePlugin(),
      queryComplexity.enable &&
        ApolloQueryComplexityPlugin(
          schema,
          queryComplexity.maxComlexity,
          queryComplexity.throwOnMaximum
        ),
      contextExtension.enable && containerExtensionPlugin(option.context),
    ].filter(Boolean),
  });

  await server.start();
  return server.createHandler({
    path: option.path,
    context: option.context,
  });
}
