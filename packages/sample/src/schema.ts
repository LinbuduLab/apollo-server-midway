import { gql } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';

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
