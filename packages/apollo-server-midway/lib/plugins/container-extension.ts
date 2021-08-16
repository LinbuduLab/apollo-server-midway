import { PluginDefinition } from 'apollo-server-core';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';
import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import {
  Context as IMidwayFaaSContext,
  IMidwayFaaSApplication,
} from '@midwayjs/faas';

export interface ContainerExtensionInfo {
  faasInfo?: boolean;
  configuration?: boolean;
  env?: boolean;
  dir?: boolean;
  framework?: boolean;
  process?: boolean;
}

export function isFaaSApp(
  context: IMidwayApplication
): context is IMidwayFaaSApplication {
  return 'getFunctionServiceName' in context;
}

// TODO: used by node app
export const contextExtensionPlugin = <
  TContext extends IMidwayContext = IMidwayFaaSContext,
  TApp extends IMidwayApplication = IMidwayFaaSApplication
>(
  context: TContext,
  app?: TApp
): PluginDefinition => ({
  requestDidStart: async () => {
    // TODO: empty on common node application
    const FAAS_INFO: Record<string, string> | string =
      app && isFaaSApp(app)
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
