import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class SampleType {
  @Field()
  SampleField: string;
}
