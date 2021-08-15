import { PluginDefinition } from 'apollo-server-core';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';
import { Context } from '@midwayjs/faas';

export const containerExtensionPlugin = (
  context: Context
): PluginDefinition => ({
  requestDidStart: async () => {
    return {
      willSendResponse: async (reqContext: GraphQLRequestContext) => {
        reqContext.response!.extensions = {
          ...reqContext.response!.extensions,
          context,
        };
      },
    };
  },
});
