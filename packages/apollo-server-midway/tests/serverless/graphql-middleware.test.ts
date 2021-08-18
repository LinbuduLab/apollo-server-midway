import { IMidwayContainer } from '@midwayjs/core';
import path from 'path';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import { GraphQLSchema, validateSchema } from 'graphql';
import {
  ApolloServer as ApolloServerKoa,
  ServerRegistration as KoaServerRegistration,
  Config as ApolloServerKoaConfig,
} from 'apollo-server-koa';
import {
  ApolloServer as ApolloServerExpress,
  ServerRegistration as ExpressServerRegistration,
  Config as ApolloServerExpressConfig,
} from 'apollo-server-express';
import {
  sharedInitGraphQLSchema,
  initKoaApolloServer,
  initExpressApolloServer,
  GraphQLKoaMiddleware,
  GraphQLExpressMiddleware,
} from '../../lib/app/graphql-middleware';
import { IMidwayExpressApplication } from '@midwayjs/express';

const schema = sharedInitGraphQLSchema({
  getApplicationContext: () => ({}),
  getBaseDir: () => path.resolve(__dirname, '../fixtures/src'),
} as IMidwayKoaApplication);

describe.skip('GraphQL Middleare', () => {
  it('should create valid GraphQL Schema', () => {
    expect(validateSchema(schema).length).toBe(0);
  });

  it('should create sevrer', () => {
    expect(
      initKoaApolloServer(
        {
          getApplicationContext: () => ({}),
        } as IMidwayKoaApplication,
        schema
      )
    ).toBeDefined();

    expect(
      initExpressApolloServer(
        {
          getApplicationContext: () => ({}),
        } as IMidwayExpressApplication,
        schema
      )
    ).toBeDefined();
  });

  it('should create middleware', () => {
    expect(new GraphQLKoaMiddleware().resolve).toBeDefined();
    expect(new GraphQLExpressMiddleware().resolve).toBeDefined();

    expect(typeof new GraphQLKoaMiddleware().resolve()).toBe('function');
    expect(typeof new GraphQLExpressMiddleware().resolve()).toBe('function');
  });

  // it('should use app & externalConfig to create middleware', () => {
  //   const koaConfig: Omit<KoaServerRegistration, 'app'> = {
  //     path: '/koa',
  //   };
  //   const expressConfig: Omit<ExpressServerRegistration, 'app'> = {
  //     path: '/express',
  //   };
  //   const koa = new GraphQLKoaMiddleware();

  //   koa.app = {
  //     getApplicationContext: () => ({}),
  //   } as IMidwayKoaApplication;
  // });
});
