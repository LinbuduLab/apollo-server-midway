import { Provide } from '@midwayjs/decorator';
import {
  ObjectType,
  Field,
  Resolver,
  createUnionType,
  Int,
  Query,
  registerEnumType,
} from 'type-graphql';
import { plainToClass } from 'class-transformer';

enum StatusEnum {
  SUCCESS = 'success',
  FAIL = 'fail',
}

registerEnumType(StatusEnum, {
  name: 'Status',
  description: 'Health check status',
});

@ObjectType()
class SuccessStatus {
  @Field()
  status: StatusEnum.SUCCESS;

  @Field(type => Int)
  experimentalField?: number;
}

@Provide()
@ObjectType()
class FailureStatus {
  @Field()
  status: StatusEnum.FAIL;

  @Field({ nullable: true })
  error?: string;
}

const StatusCheckUnion = createUnionType({
  name: 'StatusCheckUnion',
  types: () => [SuccessStatus, FailureStatus] as const,
});

@Resolver()
export class InternalResolver {
  @Query(() => StatusCheckUnion)
  HealthCheck() {
    try {
      return plainToClass(SuccessStatus, {
        status: StatusEnum.SUCCESS,
      });
    } catch (error) {
      return plainToClass(FailureStatus, {
        status: StatusEnum.FAIL,
        error,
      });
    }
  }
}
