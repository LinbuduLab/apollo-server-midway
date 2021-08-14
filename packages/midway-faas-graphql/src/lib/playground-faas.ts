import { Context as FaaSContext } from '@midwayjs/faas';
import {
  MiddlewareOptions,
  renderPlaygroundPage,
} from 'graphql-playground-html';
import { ISettings } from 'graphql-playground-html/dist/render-playground-page';
import { RenderPlaygroundQueryOptions } from './typing';

function internalOptionsToSettings(options?: RenderPlaygroundQueryOptions) {
  const settings = {} as ISettings;

  const mappings: Record<string, keyof ISettings> = {
    cursorShape: 'editor.cursorShape',
    theme: 'editor.theme',
    reuseHeaders: 'editor.reuseHeaders',
    globalHeaders: 'request.globalHeaders',
    hideTracingResponse: 'tracing.hideTracingResponse',
    tracingSupported: 'tracing.tracingSupported',
    fontSize: 'editor.fontSize',
    fontFamily: 'editor.fontFamily',
    enablePolling: 'schema.polling.enable',
    credentials: 'request.credentials',
  };

  for (const [k, v] of Object.entries(options ?? {})) {
    settings[mappings[k] as string] = v;
  }

  return settings;
}

export function midwayFaaSPlayground(options?: {
  middlewareOptions?: MiddlewareOptions;
  editorOptions?: RenderPlaygroundQueryOptions;
}) {
  return async (ctx: FaaSContext) => {
    const transformedOptions = internalOptionsToSettings(
      options?.editorOptions
    );

    const internalplaygroundSettings: ISettings = ctx.requestContext
      .getConfigService()
      .getConfiguration('graphqlPlaygroundSettings');

    const body = renderPlaygroundPage({
      ...options,
      ...{
        workspaceName: 'playground',
        settings: {
          ...internalplaygroundSettings,
          ...transformedOptions,
        },
      },
    });
    ctx.type = 'text/html';
    ctx.body = body;
  };
}
