import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
  HttpQueryError,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';
import { IncomingMessage } from 'http';

import { MidwayReq, MidwayRes } from '../shared/types';
import { handleResponse, setHeaders } from '../shared/utils';

export interface GraphQLOptionsFunction {
  (req?: MidwayReq): ValueOrPromise<GraphQLOptions>;
}

export function createApolloQueryHandler(
  options: GraphQLOptions | GraphQLOptionsFunction
) {
  const graphqlHandler = async (req: MidwayReq, res: MidwayRes) => {
    const contentType = req.headers['content-type'];

    const query = req.method === 'GET' ? req.query : req.body;

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
        method: req.method,
        options,
        query,
        request: convertNodeHttpToRequest(req as unknown as IncomingMessage),
      });

      setHeaders(res, responseInit.headers!);
      const statusCode = responseInit.status || 200;
      return handleResponse(res, statusCode, graphqlResponse);
    } catch (error) {
      const {
        name,
        headers,
        statusCode = 500,
        stack,
        message,
      } = error as HttpQueryError;

      if ('HttpQueryError' === name && headers) {
        setHeaders(res, error.headers);
      }

      return handleResponse(res, statusCode, message || stack);
    }
  };

  return graphqlHandler;
}
