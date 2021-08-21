import { Context, IMidwayFaaSApplication } from '@midwayjs/faas';
import { BuildSchemaOptions } from 'type-graphql';
import { Config as ApolloServerConfig } from 'apollo-server-core';
import { Options as CORSOptions } from '@koa/cors';
import { Options as BodyParserOptions } from 'koa-bodyparser';
import { ServerRegistration as KoaServerRegistration } from 'apollo-server-koa';
import { ServerRegistration as ExpressServerRegistration } from 'apollo-server-express';

export type MidwayReq = Context['request'];
export type MidwayRes = Context['response'];

export type MidwaySLSReqRes = {
  req: MidwayReq;
  res: MidwayRes;
};

export type UsableApolloOption = Pick<
  ApolloServerConfig,
  | 'persistedQueries'
  | 'plugins'
  | 'context'
  | 'formatError'
  | 'formatResponse'
  | 'rootValue'
  | 'dataSources'
  | 'introspection'
  | 'mocks'
  | 'mockEntireSchema'
  | 'schema'
>;

export type UsableBuildSchemaOption = Pick<
  BuildSchemaOptions,
  | 'authChecker'
  | 'authMode'
  | 'dateScalarMode'
  | 'globalMiddlewares'
  | 'nullableByDefault'
  | 'skipCheck'
  | 'resolvers'
>;

export type BuiltInPluginConfiguration = {
  /**
   * Enable Apollo-Resolve-Time plugin to report GraphQL resolving time as GraphQL Extension.
   */
  resolveTime?: {
    enable?: boolean;
  };
  /**
   * Enable Apollo-Query-Complexity plugin to report GraphQL query complexity as GraphQL Extension,
   * and reject request when query complexity is greater than configurated.
   */
  queryComplexity?: {
    enable?: boolean;
    maxComlexity?: number;
    throwOnMaximum?: boolean;
  };
  /**
   * Enable plugin to send back `MidwayJS Container` information、Application Context as GraphQL Extension.
   */
  contextExtension?: {
    enable?: boolean;
  };
  /**
   * Enable plugin to send back generated `GraphQL Schema` as GraphQL Extension.
   */
  printSchema?: {
    enable?: boolean;
    sort?: boolean;
  };
};

export type CreateGraphQLMiddlewareOption = {
  /**
   * GraphQL API path
   */
  path?: string;
  /**
   * Enable GraphQL Playground even in production.
   * Requires `apollo.introspection` to be true for working correctly.
   */
  prodPlaygound?: boolean;
  /**
   * Add `Application Context` to GraphQL Context which you can get in GraphQL Resolvers.
   */
  appendApplicationContext?: boolean;
  /**
   * Built-In plugin options.
   */
  builtInPlugins?: BuiltInPluginConfiguration;
  /**
   * Supported ApolloServer options.
   */
  apollo?: UsableApolloOption;
  /**
   * Supported TyepeGraphQL buildSchemaSync options.
   */
  schema?: UsableBuildSchemaOption &
    Pick<BuildSchemaOptions, 'emitSchemaFile' | 'container'>;
  /**
   * Disable Apollo-Server health check.
   */
  disableHealthCheck?: boolean;

  /**
   * CORS options, equal to @koa/cors options.
   */
  cors?: CORSOptions | boolean;
  /**
   * BodyParser options, equal to koa-bodyparser options.
   */
  bodyParserConfig?: BodyParserOptions | boolean;
};

export interface CreateKoaGraphQLMiddlewareOption
  extends CreateGraphQLMiddlewareOption {
  /**
   * Customize health check handler.
   */
  onHealthCheck?: KoaServerRegistration['onHealthCheck'];
}

export interface CreateExpressGraphQLMiddlewareOption
  extends CreateGraphQLMiddlewareOption {
  onHealthCheck?: ExpressServerRegistration['onHealthCheck'];
}

export type CreateApolloHandlerOption = {
  /**
   * Required. FaaS Context.
   */
  context: Context;
  /**
   * GraphQL API path
   */
  path?: string;
  /**
   * FaaS Application.
   */
  app?: IMidwayFaaSApplication;
  /**
   * Enable GraphQL Playground even in production.
   * Requires `apollo.introspection` to be true for working correctly.
   */
  prodPlaygound?: boolean;
  /**
   * Add `FaaS Context` to GraphQL Context which you can get in GraphQL Resolvers.
   */
  appendFaaSContext?: boolean;
  /**
   * Built-In plugin options.
   */
  builtInPlugins?: BuiltInPluginConfiguration;
  /**
   * Supported ApolloServer options.
   */
  apollo?: UsableApolloOption;
  /**
   * Supported TyepeGraphQL buildSchemaSync options.
   */
  schema?: UsableBuildSchemaOption;
  /**
   * Disable Apollo-Server health check.
   */
  disableHealthCheck?: boolean;
  /**
   * Disable Built-In health check resolver.
   */
  disableHealthResolver?: boolean;
  /**
   * Customize health check handler.
   */
  onHealthCheck?: (req: MidwayReq) => Promise<unknown>;
};
