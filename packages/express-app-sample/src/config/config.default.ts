import { SampleResolver } from '../resolvers/sample.resolver';
import { CreateGraphQLMiddlewareOption } from 'apollo-server-midway';

export const graphql: CreateGraphQLMiddlewareOption = {
  builtInPlugins: {},
  schema: {
    resolvers: [SampleResolver],
  },
};
