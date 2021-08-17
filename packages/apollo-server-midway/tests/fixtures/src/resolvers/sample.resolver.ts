import { Provide } from '@midwayjs/decorator';
import { Resolver, Query } from 'type-graphql';

import { SampleType } from '../graphql/sample.type';

@Provide()
@Resolver(type => SampleType)
export class SampleResolver {
  @Query(type => SampleType)
  QuerySample(): SampleType {
    return {
      SampleField: 'SampleField',
    };
  }
}
