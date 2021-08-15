import * as path from 'path';
import { Provide, Config, App } from '@midwayjs/decorator';
import {
  IWebMiddleware,
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaNext,
} from '@midwayjs/koa';

import { ApolloServer, ServerRegistration } from 'apollo-server-koa';
import { buildSchemaSync } from 'type-graphql';
import { IContext } from '../typing';

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';

@Provide('GraphQLMiddleware')
export class GraphQLMiddleware implements IWebMiddleware {
  @Config('apollo')
  config: ServerRegistration;

  @App()
  app: IMidwayKoaApplication;

  resolve() {
    return async (_ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const container = this.app.getApplicationContext();
      const schema = buildSchemaSync({
        resolvers: [path.resolve(this.app.getBaseDir(), 'resolvers/*')],
        // container,
        authMode: 'error',
        emitSchemaFile: 'schema.graphql',
      });

      const server = new ApolloServer({
        schema,
        context: {
          container,
        } as IContext,
        plugins: [
          ['production'].includes(process.env.NODE_ENV) ||
          process.env.DISABLE_PLAYGROUND
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageGraphQLPlayground({
                settings: {
                  'editor.theme': 'dark',
                  'editor.reuseHeaders': true,
                  'editor.fontSize': 14,
                  'editor.fontFamily': '"Fira Code"',
                  'schema.polling.enable': true,
                  'schema.polling.interval': 5000,
                  'tracing.hideTracingResponse': false,
                  'queryPlan.hideQueryPlanResponse': false,
                },
              }),
        ],
      });
      await server.start();

      console.log('Apollo-GraphQL Start');

      server.applyMiddleware({
        app: this.app,
        ...this.config,
      });

      await next();
    };
  }
}
