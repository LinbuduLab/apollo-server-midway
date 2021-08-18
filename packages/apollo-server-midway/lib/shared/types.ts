import { Context, IMidwayFaaSApplication } from '@midwayjs/faas';
import { BuildSchemaOptions } from 'type-graphql';
import { Config as ApolloServerConfig } from 'apollo-server-core';
import { Options as CORSOptions } from '@koa/cors';
import { Options as BodyParserOptions } from 'koa-bodyparser';

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
  resolveTime?: {
    enable?: boolean;
  };
  queryComplexity?: {
    enable?: boolean;
    maxComlexity?: number;
    throwOnMaximum?: boolean;
  };
  contextExtension?: {
    enable?: boolean;
  };
  printSchema?: {
    enable?: boolean;
    sort?: boolean;
  };
};

export type CreateGraphQLMiddlewareOption = {
  path?: string;
  prodPlaygound?: boolean;
  appendApplicationContext?: boolean;
  builtInPlugins?: BuiltInPluginConfiguration;
  apollo?: UsableApolloOption;
  schema?: UsableBuildSchemaOption;
  cors?: CORSOptions | boolean;
  bodyParserConfig?: BodyParserOptions | boolean;
};

export type CreateApolloHandlerOption = {
  context: Context;
  path?: string;
  app?: IMidwayFaaSApplication;
  prodPlaygound?: boolean;
  disableHealthCheck?: boolean;
  disableHealthResolver?: boolean;
  onHealthCheck?: (req: MidwayReq) => Promise<unknown>;
  appendFaaSContext?: boolean;
  builtInPlugins?: BuiltInPluginConfiguration;
  apollo?: UsableApolloOption;
  schema?: UsableBuildSchemaOption;
};
