import { CreateHandlerOption } from '../shared/types';

export const presetOption: Omit<CreateHandlerOption, 'context'> = {
  path: '/graphql',
  prodPlaygound: false,
  appendFaaSContext: false,
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
