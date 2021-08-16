import { Provide, Inject, App } from '@midwayjs/decorator';
import { Resolver, Query, FieldResolver, Root, Ctx } from 'type-graphql';

import { SampleType } from '../graphql/sample.type';
import { GraphQLContext } from '../typing';

@Provide()
@Resolver(type => SampleType)
export class SampleResolver {
  @Query(type => SampleType)
  QuerySample(): SampleType {
    return {
      SampleField: 'SampleField',
      Child: {
        ChildField: 'ChildField',
      },
    };
  }

  @FieldResolver(() => String)
  FieldQuerySample(@Root() sample: SampleType, @Ctx() context: GraphQLContext) {
    return `FieldQuerySample! ${sample.SampleField}`;
  }
}
