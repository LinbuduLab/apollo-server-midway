import { Context, IMidwayFaaSApplication } from '@midwayjs/faas';
import { BuildSchemaOptions } from 'type-graphql';
import { Config as ApolloServerConfig } from 'apollo-server-core';

export type MidwayReq = Context['request'];
export type MidwayRes = Context['response'];

export type MidwaySLSReqRes = {
  req: MidwayReq;
  res: MidwayRes;
};

// TODO: Built-in lib options: resolve-time query-complexity error-interceptor ...
export type CreateHandlerOption = {
  context: Context;
  path?: string;
  app?: IMidwayFaaSApplication;
  prodPlaygound?: boolean;
  disableHealthCheck?: boolean;
  onHealthCheck?: (req: MidwayReq) => Promise<unknown>;
  appendFaaSContext?: boolean;
  builtInPlugins?: {
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
  apollo?: Pick<
    ApolloServerConfig,
    | 'persistedQueries'
    | 'plugins'
    | 'context'
    | 'formatError'
    | 'formatResponse'
    | 'rootValue'
    | 'dataSources'
    | 'introspection'
  >;
  schema?: Pick<
    BuildSchemaOptions,
    | 'authChecker'
    | 'authMode'
    | 'dateScalarMode'
    | 'globalMiddlewares'
    | 'nullableByDefault'
    | 'skipCheck'
    | 'resolvers'
  >;
};
