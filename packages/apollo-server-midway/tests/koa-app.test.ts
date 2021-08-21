import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework, IMidwayKoaApplication } from '@midwayjs/koa';
import { koaAppFixturesAppDir } from './shared';
import { GraphQLKoaMiddleware } from '../../apollo-server-midway/lib/app/graphql-middleware';

describe('Node app koa module', () => {
  let app: IMidwayKoaApplication;

  beforeAll(async () => {
    try {
      app = await createApp<Framework>(koaAppFixturesAppDir, {
        baseDir: koaAppFixturesAppDir,
        cleanLogsDir: true,
        cleanTempDir: true,
      });
      // app
      //   .getApplicationContext()
      //   .registerObject('graphql:GraphQLKoaMiddleware', GraphQLKoaMiddleware);
      // app.use(await app.generateMiddleware('graphql:GraphQLKoaMiddleware'));
    } catch (err) {
      console.error('test beforeAll error', err);
      throw err;
    }
  });

  afterAll(async () => {
    await close(app);
  });

  it.skip('should GET /', async () => {
    // make request
    const result = await createHttpRequest(app)
      .get('/')
      .set('x-timeout', '5000');

    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.text).toBe('Hello Midwayjs!');
  });

  it('should GET /graphql', async () => {
    // make request
    // const result = await createHttpRequest(app).post('/graphql');
    // .set('Accept', 'text/html');
    // console.log('result: ', result);
    // const aa = await app
    //   .getApplicationContext()
    //   .getAsync('graphql:GraphQLKoaMiddleware');
    // console.log('aa: ', aa);
    // use expect by jest
    // expect(result.status).toBe(200);
  });
});
