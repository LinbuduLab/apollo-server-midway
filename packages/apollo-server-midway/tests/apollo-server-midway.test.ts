import { Config } from 'apollo-server-core';
import { createFunctionApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import path from 'path';
import { IMidwayFaaSApplication } from '@midwayjs/faas';
import { IMidwayApplication } from '@midwayjs/core';

import { ApolloServerMidway } from '../lib/serverless/apollo-server-midway';
import { getFallbackResolverPath } from '../lib/shared/utils';
import { isFaaSApp } from '../lib/plugins/container-extension';

import {
  PLAIN_USAGE_FUNC_PATH,
  PLUGIN_ENABLED_FUNC_PATH,
  USE_APOLLO_SCHEMA_FUNC_PATH,
  FULL_CONFIGURED_FUNC_PATH,
  APOLLO_SCHEMA_FUNC_PATH,
} from './fixtures/src/function/hello';
import {
  EXPECT_ERROR_QUERY,
  HEALTH_CHECK_ONLY_QUERY,
  SAMPLE_FIELD_ONLY_QUERY,
  typeDefs,
  resolvers,
  serverlsssFixturesAppDir,
} from './shared';

async function createServer(config: Config = {}): Promise<ApolloServerMidway> {
  const apolloServer = new ApolloServerMidway({
    typeDefs,
    resolvers,
    stopOnTerminationSignals: false,
    ...config,
  });
  await apolloServer.start();

  return apolloServer;
}

describe.skip('Serverless module test suite', () => {
  let app: Application;

  beforeAll(async () => {
    try {
      app = await createFunctionApp<Framework>(serverlsssFixturesAppDir, {
        baseDir: serverlsssFixturesAppDir,
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

  it('should create app and handle request', async () => {
    const result = await createHttpRequest(app).get('/');
    expect(result.text).toEqual('Hello Index!');
    expect(result.statusCode).toBe(200);
  });

  it('should initialize correctly', async () => {
    const server = await createServer();

    expect(server).toBeDefined();
    expect(server.createHandler).toBeDefined();
    expect(server.executeOperation).toBeDefined();
    expect(server.requestOptions).toBeDefined();
    expect(server.graphqlPath).toBe('/graphql');
  });

  it('should return empty or 404 page when requesting un-registered path', async () => {
    // Note: Correct Path: ${PAHT}/
    const badResult1 = await createHttpRequest(app).get(
      `${PLAIN_USAGE_FUNC_PATH}/un-registered-path`
    );

    expect(badResult1.statusCode).toBe(404);
    expect(badResult1.text).toContain('not found');

    const badResult2 = await createHttpRequest(app).get(
      `${PLAIN_USAGE_FUNC_PATH}foo`
    );
    expect(badResult2.statusCode).toBe(404);
    expect(badResult2.text).toContain('not found');

    const badResult3 = await createHttpRequest(app).get(PLAIN_USAGE_FUNC_PATH);

    expect(badResult3.statusCode).toBe(204);
    expect(badResult3.text).toBeFalsy();
  });

  it('should return playground HTML only when with `accept: text/html` header', async () => {
    const badResult = await createHttpRequest(app).get(
      `${PLAIN_USAGE_FUNC_PATH}/`
    );

    expect(badResult.statusCode).toBe(400);
    expect(badResult.text).toBe('GET query missing.');

    const requestHTMLResult = await createHttpRequest(app)
      .get(`${PLAIN_USAGE_FUNC_PATH}/`)
      .set('Accept', 'text/html');

    expect(requestHTMLResult.statusCode).toBe(200);
    expect(requestHTMLResult.text).toBeDefined();
    expect(requestHTMLResult.text).toContain('GraphQLPlayground.init');
    expect(requestHTMLResult.headers['content-type']).toBe(
      'text/html; charset=utf-8'
    );
  });

  it('should perform query', async () => {
    const result = await createHttpRequest(app)
      .post(`${PLAIN_USAGE_FUNC_PATH}/`)
      .send({
        operationName: null,
        variables: {},
        query: SAMPLE_FIELD_ONLY_QUERY,
      });

    expect(result.statusCode).toBe(200);
    expect(result.headers['content-type']).toBe(
      'application/json; charset=utf-8'
    );
    expect(result.body).toMatchObject({
      data: {
        QuerySample: {
          SampleField: 'SampleField',
        },
      },
    });

    // default enabled built-in plugin
    expect(typeof result.body.extensions.RESOLVE_TIME).toBe('number');
    expect(typeof result.body.extensions.CURRENT_COMPLEXITY).toBe('number');

    expect(result.body.extensions.RESOLVE_TIME).toBeGreaterThan(0);
    expect(result.body.extensions.CURRENT_COMPLEXITY).toBe(2);
  });

  it('should handle health check query', async () => {
    const result = await createHttpRequest(app)
      .post(`${PLAIN_USAGE_FUNC_PATH}/`)
      .send({
        operationName: null,
        variables: {},
        query: HEALTH_CHECK_ONLY_QUERY,
      });

    expect(result.statusCode).toBe(200);
    expect(result.headers['content-type']).toBe(
      'application/json; charset=utf-8'
    );
    expect(result.body).toMatchObject({
      data: {
        HealthCheck: {
          __typename: 'SuccessStatus',
          status: 'success',
        },
      },
    });

    expect(typeof result.body.extensions.RESOLVE_TIME).toBe('number');
    expect(typeof result.body.extensions.CURRENT_COMPLEXITY).toBe('number');

    expect(result.body.extensions.RESOLVE_TIME).toBeGreaterThan(0);
    expect(result.body.extensions.CURRENT_COMPLEXITY).toBe(2);

    const apolloResult = await createHttpRequest(app)
      .post(`${PLAIN_USAGE_FUNC_PATH}/?apollo_health_check=true`)
      .send({
        operationName: null,
        variables: {},
        query: HEALTH_CHECK_ONLY_QUERY,
      });

    expect(result.statusCode).toBe(200);
    expect(result.headers['content-type']).toBe(
      'application/json; charset=utf-8'
    );

    expect(apolloResult.body).toMatchObject({
      status: 'pass',
    });
  });

  it('should handle health check query(expect error)', async () => {
    const result = await createHttpRequest(app)
      .post(`${PLAIN_USAGE_FUNC_PATH}/`)
      .send({
        operationName: null,
        variables: {},
        query: EXPECT_ERROR_QUERY,
      });

    expect(result.statusCode).toBe(200);
    expect(result.headers['content-type']).toBe(
      'application/json; charset=utf-8'
    );
    expect(result.body).toMatchObject({
      data: {
        HealthCheck: {
          __typename: 'FailureStatus',
          status: 'fail',
        },
      },
    });
  });

  it('should take plugin extensions', async () => {
    const result = await createHttpRequest(app)
      .post(`${PLUGIN_ENABLED_FUNC_PATH}/`)
      .send({
        operationName: null,
        variables: {},
        query: SAMPLE_FIELD_ONLY_QUERY,
      });

    expect(result.statusCode).toBe(200);
    expect(result.headers['content-type']).toBe(
      'application/json; charset=utf-8'
    );

    expect(isFaaSApp({} as IMidwayApplication)).toBeFalsy();
    expect(
      isFaaSApp({
        getFunctionServiceName: () => 'ANY',
      } as unknown as IMidwayApplication)
    ).toBeTruthy();

    expect(result.body.extensions.RESOLVE_TIME).toBeDefined();
    expect(result.body.extensions.CURRENT_COMPLEXITY).toBeDefined();
    expect(result.body.extensions.CONTEXT).toBeDefined();
    expect(result.body.extensions.FAAS_INFO).toBeDefined();
    expect(result.body.extensions.SCHEMA).toBeDefined();

    expect(typeof result.body.extensions.RESOLVE_TIME).toBe('number');
    expect(typeof result.body.extensions.CURRENT_COMPLEXITY).toBe('number');
    expect(typeof result.body.extensions.CONTEXT).toBe('object');
    expect(typeof result.body.extensions.FAAS_INFO).toBe('string');
    expect(typeof result.body.extensions.SCHEMA).toBe('string');
  });

  it('should get fallback reolvers', () => {
    const tmpApp = {
      getBaseDir: () => 'TMP_DIR',
    };
    expect(getFallbackResolverPath()).toEqual([
      path.join(__dirname, '../', 'lib/resolver/*'),
      path.join(__dirname, '../', 'lib/resolvers/*'),
    ]);

    expect(
      getFallbackResolverPath(tmpApp as unknown as IMidwayFaaSApplication)
    ).toEqual([
      path.resolve(tmpApp.getBaseDir(), 'resolver/*'),
      path.resolve(tmpApp.getBaseDir(), 'resolvers/*'),
    ]);
  });
});
