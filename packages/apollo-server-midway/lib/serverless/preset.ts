import { CreateHandlerOption } from '../shared/types';

const DEV_MODE = process.env.NODE_ENV !== 'production';

export const presetOption: Omit<CreateHandlerOption, 'context'> = {
  path: '/graphql',
  prodPlaygound: false,
  appendFaaSContext: false,
  disableHealthCheck: DEV_MODE,
  disableHealthResolver: DEV_MODE,
  builtInPlugins: {
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
  },
  apollo: {
    context: {},
    rootValue: {},
    introspection: true,
    plugins: [],
    mocks: false,
    mockEntireSchema: false,
  },
  schema: {
    dateScalarMode: 'timestamp',
    nullableByDefault: false,
    skipCheck: false,
    resolvers: ['SKIP_NON_EMPTY_ARRAY_CHECK'],
    globalMiddlewares: [],
    authMode: 'error',
  },
};
