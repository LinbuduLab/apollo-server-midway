import { CreateGraphQLMiddlewareOption } from 'apollo-server-midway';

export const graphql: CreateGraphQLMiddlewareOption = {
  builtInPlugins: {
    queryComplexity: {
      enable: false,
    },
  },
};
