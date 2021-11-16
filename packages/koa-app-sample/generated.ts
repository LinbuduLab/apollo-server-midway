import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class Root {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}
