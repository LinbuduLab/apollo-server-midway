import { PluginDefinition } from 'apollo-server-core';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';
import { Context, IMidwayFaaSApplication } from '@midwayjs/faas';

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
      : 'Pass `app` to handler option to check faas info';

    return {
      willSendResponse: async (reqContext: GraphQLRequestContext) => {
        reqContext.response!.extensions = {
          ...reqContext.response!.extensions,
          context,
          FAAS_INFO,
        };
      },
    };
  },
});
