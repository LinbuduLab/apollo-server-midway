import { Provide } from '@midwayjs/decorator';
import { Resolver, Query, Ctx } from 'type-graphql';

import { DogType } from '../graphql/dog.type';
import { GraphQLContext } from '../typing';

@Provide()
@Resolver(type => DogType)
export class SampleResolver {
  @Query(type => DogType)
  async QueryRandomDog(@Ctx() context: GraphQLContext) {
    const dogAPI = context.dataSources.dog;
    const { status, message } = await dogAPI.getRandomDog();
    return {
      status,
      message,
    };
  }
}
