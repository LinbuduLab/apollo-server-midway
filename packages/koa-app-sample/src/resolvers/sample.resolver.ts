import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
import { Provide, Inject, App } from '@midwayjs/decorator';
import { IMidwayKoaContext } from '@midwayjs/koa';

import { Resolver, Query, FieldResolver, Root, Ctx } from 'type-graphql';

import { SampleType } from '../graphql/sample.type';

interface IContext {
  container: IMidwayContainer;
  reqCtx: IMidwayKoaContext;
}

@Provide()
@Resolver(type => SampleType)
export class SampleResolver {
  @Inject()
  foo: string;

  @App()
  app: IMidwayApplication;

  @Query(type => SampleType)
  QuerySample(): SampleType {
    return {
      SampleField: 'SampleField',
      Child: {
        ChildField: 'ChildField',
      },
    };
  }

  @Query(type => SampleType)
  QueryApplicationContext(@Ctx() ctx: IContext): SampleType {
    console.log('header', ctx.reqCtx.header['authorization']);
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
