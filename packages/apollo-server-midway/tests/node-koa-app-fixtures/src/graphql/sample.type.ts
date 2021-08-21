import { ObjectType, Field } from 'type-graphql';
import { ChildType } from './child.type';

@ObjectType()
export class SampleType {
  @Field()
  SampleField: string;

  @Field(type => ChildType)
  Child?: ChildType;
}
