import { ISettings } from 'graphql-playground-html/dist/render-playground-page';

export interface RenderPlaygroundQueryOptions {
  cursorShape: ISettings['editor.cursorShape'];
  theme: ISettings['editor.theme'];
  reuseHeaders: ISettings['editor.reuseHeaders'];
  globalHeaders: ISettings['request.globalHeaders'];
  hideTracingResponse: ISettings['tracing.hideTracingResponse'];
  tracingSupported: ISettings['tracing.tracingSupported'];
  fontSize: ISettings['editor.fontSize'];
  fontFamily: ISettings['editor.fontFamily'];
  enablePolling: ISettings['schema.polling.enable'];
  credentials: ISettings['request.credentials'];
}

export interface PluginConfig {
  // FIXME: use NonEmptyArray
  resolvers: string[];
  // TODO: 选项合并
  playground?: boolean;
  rootValue?: any;
  context?: Record<string, unknown>;
}
