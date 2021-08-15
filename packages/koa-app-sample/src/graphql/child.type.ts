import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class ChildType {
  @Field()
  ChildField!: string;
}
