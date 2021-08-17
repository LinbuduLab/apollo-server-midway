import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { CreateGraphQLMiddlewareOption } from 'apollo-server-midway';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export type ExtendedConfig = DefaultConfig & {
  graphql: CreateGraphQLMiddlewareOption;
};

export default (appInfo: EggAppInfo) => {
  const config = {} as ExtendedConfig;

  config.keys = appInfo.name + '_{{keys}}';

  config.graphql = {};

  config.salt = 20;

  config.security = {
    csrf: false,
  };

  return config;
};
