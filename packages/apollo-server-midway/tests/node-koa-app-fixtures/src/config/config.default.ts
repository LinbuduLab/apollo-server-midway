import { CreateGraphQLMiddlewareOption } from '../../../../lib';

export const graphql: CreateGraphQLMiddlewareOption = {
  builtInPlugins: {},
  prodPlaygound: true,
  apollo: {
    introspection: true,
  },
};
