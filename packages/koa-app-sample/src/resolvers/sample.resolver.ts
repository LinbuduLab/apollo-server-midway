import { Provide, Inject } from '@midwayjs/decorator';
import { Resolver, Query, FieldResolver, Root } from 'type-graphql';

import { SampleType } from '../graphql/sample.type';

@Provide()
@Resolver(type => SampleType)
export class SampleResolver {
  @Inject()
  foo: string;

  @Query(type => SampleType)
  QuerySample(): SampleType {
    console.log(this.foo);
    return {
      SampleField: 'SampleField',
      Child: {
        ChildField: 'ChildField',
      },
    };
  }

  @FieldResolver(() => String)
  FieldQuerySample(@Root() sample: SampleType) {
    return `FieldQuerySample! ${sample.SampleField}`;
  }
}
