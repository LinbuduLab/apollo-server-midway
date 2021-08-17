import path from 'path';
import { IMidwayApplication } from '@midwayjs/core';
import { MidwayRes } from './types';
import { NonEmptyArray } from 'type-graphql';

export const handleResponse = (
  res: MidwayRes,
  statusCode: number,
  responseBody: unknown
): undefined => {
  res.status = statusCode;
  res.body = responseBody;
  return undefined;
};

export const setHeaders = (
  res: MidwayRes,
  headers: Record<string, string>
): void => {
  for (const [header, value] of Object.entries(headers)) {
    res.set(header, value);
  }
};

export const getFallbackResolverPath = <TAppContext extends IMidwayApplication>(
  app?: TAppContext
): NonEmptyArray<string> => {
  return app
    ? [
        path.resolve(app.getBaseDir(), 'resolver/*'),
        path.resolve(app.getBaseDir(), 'resolvers/*'),
      ]
    : [
        // assert it's located in src/functions/
        path.resolve(__dirname, '../resolver/*'),
        path.resolve(__dirname, '../resolvers/*'),
      ];
};
