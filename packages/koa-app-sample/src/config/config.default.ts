import path from 'path';
import { ServerRegistration } from 'apollo-server-koa/dist/ApolloServer';
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export type ExtendedConfig = DefaultConfig & {
  apollo: Omit<ServerRegistration, 'app'>;
};

export default (appInfo: EggAppInfo) => {
  const config = {} as ExtendedConfig;

  config.keys = appInfo.name + '_{{keys}}';

  config.apollo = {
    path: '/graphql',
  };

  config.salt = 20;

  // console.log(path.join(__dirname, '../entities/*'));

  config.security = {
    csrf: false,
  };

  return config;
};
