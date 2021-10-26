import { Provide, Config, App } from '@midwayjs/decorator';
import {
  IWebMiddleware,
  IMidwayKoaApplication,
  IMidwayKoaContext,
  IMidwayKoaNext,
} from '@midwayjs/koa';

import { ApolloServer, ServerRegistration } from 'apollo-server-koa';
import { buildSchemaSync, ResolverData } from 'type-graphql';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';

import { SampleResolver } from '../resolvers/sample.resolver';
import { IMidwayContainer } from '@midwayjs/core';

@Provide('extend:GraphQLKoaMiddleware')
export class GraphQLMiddleware implements IWebMiddleware {
  @Config('apollo')
  config: ServerRegistration;

  @App()
  app: IMidwayKoaApplication;

  resolve() {
    return async (_ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const container = this.app.getApplicationContext();

      const schema = buildSchemaSync({
        resolvers: [SampleResolver],
        // 使用应用上下文作为容器
        // container,
        // 使用请求上下文作为容器
        container: ({
          context,
        }: ResolverData<{ container: IMidwayContainer }>) => context.container,
        authMode: 'error',
        emitSchemaFile: 'schema.graphql',
      });

      const server = new ApolloServer({
        schema,
        // 这里的 ctx 实际上是被 Midway 处理过的，所以你可以拿到 requestContext
        context: ({ ctx }: { ctx: IMidwayKoaContext }) => {
          return {
            container: ctx.requestContext,
            reqCtx: ctx,
          };
        },
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
        // introspection: true,
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
