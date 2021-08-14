import { ISettings } from 'graphql-playground-html/dist/render-playground-page';
import { PluginConfig } from 'midway-faas-graphql';

export const graphqlPlaygroundSettings = {
  'editor.cursorShape': 'line',
  'editor.theme': 'dark',
  'editor.reuseHeaders': true,
  'request.globalHeaders': {},
  'tracing.hideTracingResponse': false,
  'tracing.tracingSupported': true,
  'editor.fontSize': 14,
  'editor.fontFamily': 'Fira Code',
  'schema.polling.enable': false,
  'request.credentials': 'include',
} as ISettings;

export const faasGraphQLConfig: PluginConfig = {
  // will not be loaded for now
  resolvers: [],
  playground: true,
  context: {
    sampleContextValue: 'sampleContextValue',
  },
};
