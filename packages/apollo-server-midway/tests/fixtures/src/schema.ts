import { gql } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefs = gql`
  type Query {
    QueryUsers: [User!]!
    QueryUserById(id: Int!): User
  }
  type User {
    id: Int
    name: String
  }
`;
const users = [
  { id: 0, name: 'Linbudu' },
  { id: 1, name: 'Harold' },
];

const resolvers = {
  Query: {
    QueryUsers() {
      return users;
    },
    QueryUserById(parent, { id }) {
      return users.find(user => user.id === id);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
