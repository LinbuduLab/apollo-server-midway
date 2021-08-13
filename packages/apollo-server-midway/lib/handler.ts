import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';
import { IncomingMessage } from 'http';
import { MidwayReq, MidwayRes } from './types';

export interface GraphQLOptionsFunction {
  (req?: MidwayReq): ValueOrPromise<GraphQLOptions>;
}

function setHeaders(res: MidwayRes, headers: Record<string, string>): void {
  Object.entries(headers).forEach(([header, value]) => {
    res.set(header, value);
  });
}

export function graphqlCoreHandler(
  options: GraphQLOptions | GraphQLOptionsFunction
) {
  const graphqlHandler = async (req: MidwayReq, res: MidwayRes) => {
    const query = req.method === 'GET' ? req.query : req.body;

    const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
      method: req.method,
      options,
      query,
      request: convertNodeHttpToRequest(req as unknown as IncomingMessage),
    });

    setHeaders(res, responseInit.headers!);
    const statusCode = responseInit.status || 200;
    res.status = statusCode;
    res.body = graphqlResponse;
    return undefined;
  };

  return graphqlHandler;
}
