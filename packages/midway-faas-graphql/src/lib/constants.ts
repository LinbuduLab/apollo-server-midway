import { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from 'apollo-server-core/dist/plugin/landingPage/graphqlPlayground';
import { gql } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';

export const ORIGIN_GRAPHQL_HANDLER_PATH = '/graphql';
export const APOLLO_SERVER_MIDWAY_PATH = '/apollo';
export const DEPRECATED_HANDLER_PATH = '/deprecated';

const typeDefs = gql`
  type Query {
    users: [User!]!
    user(username: String): User
  }
  type User {
    name: String
    username: String
  }
`;
const users = [
  { name: 'Leeroy Jenkins', username: 'leeroy' },
  { name: 'Foo Bar', username: 'foobar' },
];

const resolvers = {
  Query: {
    users() {
      return users;
    },
    user(parent, { username }) {
      return users.find(user => user.username === username);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const playgroundDefaultSettings: ApolloServerPluginLandingPageGraphQLPlaygroundOptions['settings'] =
  {
    'editor.cursorShape': 'line',
    'editor.theme': 'dark',
    'editor.reuseHeaders': true,
    'tracing.hideTracingResponse': false,
    'queryPlan.hideQueryPlanResponse': false,
    'editor.fontSize': 14,
    'editor.fontFamily': 'Fira Code',
    'schema.polling.enable': true,
    'schema.polling.interval': 2000,
  };
