import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class DogType {
  @Field()
  status: string;

  @Field()
  message: string;
}
