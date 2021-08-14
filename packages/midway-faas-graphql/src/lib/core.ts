import { graphql, GraphQLSchema, printSchema, Source } from 'graphql';
import { Context as FaaSContext } from '@midwayjs/faas';
import { Provide } from '@midwayjs/decorator';
import * as path from 'path';
import { buildSchemaSync, ClassType, Maybe, ResolverData } from 'type-graphql';
import { midwayFaaSPlayground } from './playground-faas';
import { ErrorInterceptor } from './error-interceptor';

import { PluginConfig, RenderPlaygroundQueryOptions } from './typing';
import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';

export interface GraphQLContext extends FaaSContext {
  __key__: never;
}

@Provide('GraphQLService')
export class GraphQLService {
  _schema?: GraphQLSchema;
  config: PluginConfig;

  constructor(container: IMidwayContainer, internalConfig: PluginConfig) {
    // FIXME:
    this.config = internalConfig;
    this._init();
  }

  private _init() {
    const schema = this.buildGraphQLSchema();
    this._schema = schema;
  }

  // TODO: built-in options
  // useErrorInterceptor
  // resolvers
  // useContainer
  // useDirectives
  // useScalars
  // dateScalarMode
  // resolverTimeExtension
  // complexity
  private buildGraphQLSchema() {
    return buildSchemaSync({
      resolvers: [path.resolve(__dirname, 'resolver/*')],
      dateScalarMode: 'timestamp',

      globalMiddlewares: [ErrorInterceptor],
      container: () => {
        return {
          get: (target: ClassType, data: ResolverData<GraphQLContext>) => {
            // or resolve
            return data.context.requestContext.getAsync(target);
          },
        };
      },
    });
  }

  get schema(): GraphQLSchema {
    return this._schema;
  }

  async handler(ctx: FaaSContext, config: PluginConfig) {
    // 如果resolver也要提供，那么schema就需要重新构建了，不太行
    let body = ctx.req.body;
    if (body) {
      body = JSON.parse(body);
    }

    const { query, variables } = body;

    if (!this.schema || !Object.keys(this.schema).length) {
      throw new Error('[ Midway-FaaS-GraphQL ] Invalid Built GraphQLSchema');
    }

    return await graphql({
      schema: this.schema,
      source: query,
      variableValues: variables,
      contextValue: {
        // ...(this.config.context ?? {}),
        ...(config.context ?? {}),
        ...ctx,
      },
      // rootValue: this.config.rootValue ?? {},
      rootValue: config.rootValue ?? {},
    });
  }

  async playground(
    ctx: FaaSContext,
    renderOptions: RenderPlaygroundQueryOptions
  ) {
    return midwayFaaSPlayground({ editorOptions: renderOptions })(ctx);
  }
}
