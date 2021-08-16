import { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from 'apollo-server-core/dist/plugin/landingPage/graphqlPlayground';

export const ORIGIN_GRAPHQL_HANDLER_PATH = '/graphql';
export const APOLLO_SERVER_MIDWAY_PATH = '/apollo';

export const playgroundDefaultSettings: ApolloServerPluginLandingPageGraphQLPlaygroundOptions['settings'] =
  {
    'editor.cursorShape': 'line',
    'editor.theme': 'dark',
    'editor.reuseHeaders': true,
    'tracing.hideTracingResponse': false,
    'queryPlan.hideQueryPlanResponse': false,
    'editor.fontSize': 14,
    'editor.fontFamily': 'Fira Code',
    'schema.polling.enable': true,
    'schema.polling.interval': 2000,
  };
