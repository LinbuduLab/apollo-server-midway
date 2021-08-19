import {
  ObjectType,
  Field,
  Resolver,
  createUnionType,
  Int,
  Query,
  registerEnumType,
  Arg,
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
  HealthCheck(@Arg('expectError', { nullable: true }) expectError: boolean) {
    const succeed = () =>
      plainToClass(SuccessStatus, {
        status: StatusEnum.SUCCESS,
      });

    const failed = (error?: unknown) =>
      plainToClass(FailureStatus, {
        status: StatusEnum.FAIL,
        error,
      });

    try {
      if (expectError) {
        throw new Error('EXPECTED_ERROR');
      }

      return succeed();
    } catch (error) {
      return failed(error);
    }
  }
}
