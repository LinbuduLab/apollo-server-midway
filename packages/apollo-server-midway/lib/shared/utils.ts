import { MidwayRes } from './types';

export const handleResponse = (
  res: MidwayRes,
  statusCode: number,
  responseBody: unknown
) => {
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
