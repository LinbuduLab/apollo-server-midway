import { Context } from '@midwayjs/faas';

export const handleResponse = (
  res: Context['response'],
  statusCode: number,
  responseBody: unknown
) => {
  res.status = statusCode;
  res.body = responseBody;
  return undefined;
};
