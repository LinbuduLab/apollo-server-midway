import { GraphQLSchema, lexicographicSortSchema, printSchema } from 'graphql';
import { PluginDefinition } from 'apollo-server-core';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';

export const printSchemaExtensionPlugin = (
  schema: GraphQLSchema,
  printOption?: { sort?: boolean }
): PluginDefinition => ({
  requestDidStart: async () => {
    return {
      willSendResponse: async (reqContext: GraphQLRequestContext) => {
        const schemaToEmit = printOption.sort
          ? lexicographicSortSchema(schema)
          : schema;

        const schemaContent = printSchema(schemaToEmit, {
          commentDescriptions: false,
        });

        reqContext.response.extensions = {
          ...reqContext.response.extensions,
          SCHEMA: schemaContent,
        };
      },
    };
  },
});
