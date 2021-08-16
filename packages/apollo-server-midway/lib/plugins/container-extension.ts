import { PluginDefinition } from 'apollo-server-core';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';
import { Context, IMidwayFaaSApplication } from '@midwayjs/faas';

export interface ContainerExtensionInfo {
  faasInfo?: boolean;
  configuration?: boolean;
  env?: boolean;
  dir?: boolean;
  framework?: boolean;
  process?: boolean;
}

// TODO: used by node app
export const contextExtensionPlugin = (
  context: Context,
  app?: IMidwayFaaSApplication
): PluginDefinition => ({
  requestDidStart: async () => {
    const FAAS_INFO: Record<string, string> | string = app
      ? {
          SERVICE: app.getFunctionServiceName(),
          FUNCTION: app.getFunctionName(),
          PROJECT: app.getProjectName(),
        }
      : 'Pass `app` to handler option to check faas info as extension fields.';

    return {
      willSendResponse: async (reqContext: GraphQLRequestContext) => {
        reqContext.response.extensions = {
          ...reqContext.response.extensions,
          context,
          FAAS_INFO,
          CONFIGURATION: app
            .getApplicationContext()
            .getConfigService()
            .getConfiguration(),
          APP_DIR: app.getAppDir(),
          BASE_DIR: app.getBaseDir(),
          ENV: app.getEnv(),
          FRAMEWORK: app.getFrameworkType(),
          PROCESS: app.getProcessType(),
        };
      },
    };
  },
});
