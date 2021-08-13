import { PluginDefinition } from 'apollo-server-core';
import {
  GraphQLRequestContext,
  GraphQLRequestContextDidResolveOperation,
} from 'apollo-server-plugin-base';
import { GraphQLSchema } from 'graphql';
import {
  getComplexity,
  simpleEstimator,
  fieldExtensionsEstimator,
} from 'graphql-query-complexity';

export const queryComplexityExtensionPlugin = <Context>(
  schema: GraphQLSchema,
  maxComlexity = Infinity,
  throwOnMaximum = true
): PluginDefinition => {
  return {
    requestDidStart: async () => {
      let complexity: number;

      return {
        didResolveOperation: async (
          reqContext: GraphQLRequestContextDidResolveOperation<Context>
        ) => {
          const { request, document } = reqContext;
          complexity = getComplexity({
            schema,
            operationName: request.operationName,
            query: document,
            variables: request.variables,
            estimators: [
              fieldExtensionsEstimator(),
              simpleEstimator({ defaultComplexity: 1 }),
            ],
          });

          if (
            maxComlexity !== Infinity &&
            complexity > maxComlexity &&
            throwOnMaximum
          ) {
            process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true';
            throw new Error(
              `Current query complexity is ${complexity} and max allowed complexity is ${maxComlexity}`
            );
          }
        },

        willSendResponse: async (reqContext: GraphQLRequestContext) => {
          reqContext.response!.extensions = {
            ...reqContext.response!.extensions,
            CURRENT_COMPLEXITY: complexity,
          };
        },
      };
    },
  };
};
