import { gql } from 'apollo-server-core';
import path from 'path';

export const SAMPLE_FIELD_ONLY_QUERY = /* GraphQL */ `
  query {
    QuerySample {
      SampleField
    }
  }
`;

export const HEALTH_CHECK_ONLY_QUERY = /* GraphQL */ `
  query {
    HealthCheck {
      __typename
      ... on SuccessStatus {
        status
      }
      ... on FailureStatus {
        status
      }
    }
  }
`;

export const EXPECT_ERROR_QUERY = /* GraphQL */ `
  query {
    HealthCheck(expectError: true) {
      __typename
      ... on SuccessStatus {
        status
      }
      ... on FailureStatus {
        status
      }
    }
  }
`;

export const typeDefs = gql`
  type Query {
    hello: String
  }
`;

export const resolvers = {
  Query: {
    hello: () => 'Hello! Linbudu.',
  },
};

export const serverlsssFixturesAppDir = path.join(__dirname, './fixtures');

export const koaAppFixturesAppDir = path.join(
  __dirname,
  './node-koa-app-fixtures'
);
