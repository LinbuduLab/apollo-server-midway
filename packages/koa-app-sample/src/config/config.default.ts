import { SampleResolver } from '../resolvers/sample.resolver';
import { CreateGraphQLMiddlewareOption } from 'apollo-server-midway';
import { ServerRegistration } from 'apollo-server-koa';

export const graphql: CreateGraphQLMiddlewareOption = {
  builtInPlugins: {},
  schema: {
    resolvers: [SampleResolver],
  },
  path: '/graphql',
};

export const apollo: Omit<ServerRegistration, 'app'> = {
  path: '/graphql',
};
