import {
  CreateApolloHandlerOption,
  BuiltInPluginConfiguration,
  UsableApolloOption,
  UsableBuildSchemaOption,
  CreateGraphQLMiddlewareOption,
} from '../shared/types';
import pick from 'lodash/pick';

const DEV_MODE = process.env.NODE_ENV !== 'production';

export const presetBuiltInPluginOption: BuiltInPluginConfiguration = {
  resolveTime: {
    enable: DEV_MODE,
  },
  queryComplexity: {
    enable: DEV_MODE,
  },
  contextExtension: {
    enable: false,
  },
  printSchema: {
    enable: false,
    sort: true,
  },
};
export const presetApolloOption: UsableApolloOption = {
  context: {},
  rootValue: {},
  introspection: true,
  plugins: [],
  mocks: false,
  mockEntireSchema: false,
  schema: undefined,
};

export const presetBuildSchemaOption: UsableBuildSchemaOption = {
  dateScalarMode: 'timestamp',
  nullableByDefault: false,
  skipCheck: false,
  globalMiddlewares: [],
  authMode: 'error',
  resolvers: ['SKIP_NON_EMPTY_CHECK'],
};

export const presetCreateMiddlewareOption: CreateGraphQLMiddlewareOption = {
  path: '/graphql',
  prodPlaygound: false,
  appendApplicationContext: false,
  disableHealthCheck: DEV_MODE,
  builtInPlugins: pick(presetBuiltInPluginOption, [
    'resolveTime',
    'queryComplexity',
  ]),
  apollo: presetApolloOption,
  schema: {
    ...presetBuildSchemaOption,
    emitSchemaFile: 'schema.graphql',
    container: null,
  },
  bodyParserConfig: undefined,
};

export const presetOption: Omit<CreateApolloHandlerOption, 'context'> = {
  path: '/graphql',
  prodPlaygound: false,
  appendFaaSContext: false,
  disableHealthCheck: DEV_MODE,
  disableHealthResolver: DEV_MODE,
  builtInPlugins: presetBuiltInPluginOption,
  apollo: presetApolloOption,
  schema: presetBuildSchemaOption,
};
