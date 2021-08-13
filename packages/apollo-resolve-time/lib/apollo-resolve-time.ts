import { PluginDefinition } from 'apollo-server-core';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';

export const resolveTimeExtensionPlugin = (): PluginDefinition => ({
  requestDidStart: async () => {
    const startAt = new Date();
    const startAtTime = startAt.getTime();
    const startAtString = startAt.toLocaleString();

    return {
      willSendResponse: async (reqContext: GraphQLRequestContext) => {
        const sendAt = new Date();
        const sendAtTime = sendAt.getTime();
        const sendAtString = sendAt.toLocaleString();

        reqContext.response!.extensions = {
          ...reqContext.response!.extensions,
          RESOLVE_TIME: sendAtTime - startAtTime,
        };
      },
    };
  },
});
