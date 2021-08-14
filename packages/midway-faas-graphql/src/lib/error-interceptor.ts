import { MiddlewareFn } from 'type-graphql';
import { Context as FaaSContext } from '@midwayjs/faas';

export const ErrorInterceptor: MiddlewareFn<FaaSContext> = async (
  { context, info },
  next
) => {
  try {
    return await next();
  } catch (err) {
    console.error(err);
    // rethrow the error
    throw err;
  }
};
