import { ApolloServerMidway } from '../../lib/serverless/apollo-server-midway';
import { Config, gql } from 'apollo-server-core';
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';

import path from 'path';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello! Linbudu.',
  },
};

async function createServer(
  options: Record<string, unknown> = {},
  config: Config = {}
): Promise<ApolloServerMidway> {
  const apolloServer = new ApolloServerMidway({
    typeDefs,
    resolvers,
    stopOnTerminationSignals: false,
    ...config,
  });
  await apolloServer.start();
  // const service = micro(apolloServer.createHandler(options));
  // const uri = await listen(service);
  // return {
  //   service,
  //   uri,
  // };

  return apolloServer;
}

const fixturesAppDir = path.join(__dirname, '../fixtures');

describe('Serverless module test suite', () => {
  let app: Application;

  beforeAll(async () => {
    try {
      app = await createFunctionApp<Framework>(fixturesAppDir, {
        baseDir: fixturesAppDir,
        cleanLogsDir: true,
        cleanTempDir: true,
      });
    } catch (error) {
      console.log('error: ', error);
    }
  });

  afterAll(async () => {
    await close(app);
  });

  it.skip('should create app and handle request', async () => {
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('Hello, Index!');
    expect(result.statusCode).toBe(200);
  });

  it.skip('should initialize correctly', async () => {
    const server = await createServer();

    expect(server).toBeDefined();
    expect(server.createHandler).toBeDefined();
    expect(server.executeOperation).toBeDefined();
    expect(server.requestOptions).toBeDefined();
    expect(server.graphqlPath).toBe('/graphql');
  });

  it.skip('should return empty or 404 page when requesting un-registered path', async () => {
    const badResult1 = await createHttpRequest(app).get(
      '/graphql/un-registered-path'
    );

    expect(badResult1.statusCode).toBe(404);
    expect(badResult1.text).toContain('not found');

    const badResult2 = await createHttpRequest(app).get('/graphqlss/');
    expect(badResult2.statusCode).toBe(404);
    expect(badResult2.text).toContain('not found');

    const badResult3 = await createHttpRequest(app).get('/graphql');

    expect(badResult3.statusCode).toBe(204);
    expect(badResult3.text).toBeFalsy();
  });

  it.skip('should return playground HTML only when with `accept: text/html` header', async () => {
    const badResult = await createHttpRequest(app).get('/graphql/');

    expect(badResult.statusCode).toBe(400);
    expect(badResult.text).toBe('GET query missing.');

    const requestHTMLResult = await createHttpRequest(app)
      .get('/graphql/')
      .set('Accept', 'text/html');

    expect(requestHTMLResult.statusCode).toBe(200);
    expect(requestHTMLResult.text).toBeDefined();
    expect(requestHTMLResult.text).toContain('GraphQLPlayground.init');
    expect(requestHTMLResult.headers['content-type']).toBe(
      'text/html; charset=utf-8'
    );
  });

  it.skip('should perform query', async () => {
    const result = await createHttpRequest(app).post('/graphql/').send({
      operationName: null,
      variables: {},
      // TODO: use query builder ?
      query: '{\n  QuerySample {\n    SampleField\n  }\n}\n',
    });

    expect(result.statusCode).toBe(200);
    expect(result.headers['content-type']).toBe(
      'application/json; charset=utf-8'
    );
    expect(result.body).toEqual({
      data: {
        QuerySample: {
          SampleField: 'SampleField',
        },
      },
      extensions: { RESOLVE_TIME: 11, CURRENT_COMPLEXITY: 2 },
    });
  });

  it('should perform health check when no disabled', () => {
    // 需要 mock 掉 experimentalCreateHandler 的导入
  });

  // TODO: extension plugin tests
  // mock掉 createHandler 还是使用多个不同的函数测试不同选项？
  // plain
  // built-in-plugin-enabled
  // schema
  // apollo
  // full
});
