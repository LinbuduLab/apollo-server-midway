import {
  Scope,
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  savePropertyMetadata,
  attachPropertyMetadata,
  attachClassMetadata,
} from '@midwayjs/decorator';

const MODEL_KEY = 'decorator:model';

// TODO:
// @Ctx

// export function Model(): ClassDecorator {
//   return (target: any) => {
//     // 将装饰的类，绑定到该装饰器，用于后续能获取到 class
//     saveModule(MODEL_KEY, target);
//     // 保存一些元数据信息，任意你希望存的东西
//     saveClassMetadata(
//       MODEL_KEY,
//       {
//         test: 'abc',
//       },
//       target
//     );
//     // 指定 IoC 容器创建实例的作用域，这里注册为请求作用域，这样能取到 ctx
//     Scope(ScopeEnum.Request)(target);
//   };
// }

export type ClassType = new (...args: unknown[]) => unknown;

const CONTEXT_DECORATOR_KEY = 'decorator:graphql:ctx';

export function Ctx(): PropertyDecorator {
  return (target: ClassType, propKey: string) => {
    console.log('propKey: ', propKey);
    console.log('target: ', target);
    // saveModule(CONTEXT_DECORATOR_KEY, target);

    savePropertyMetadata(
      CONTEXT_DECORATOR_KEY,
      {
        test: 'tmp',
      },
      target,
      propKey
    );
    Scope(ScopeEnum.Singleton)(target);
  };
}

export function Tmp(): PropertyDecorator {
  return target => {
    attachClassMetadata('X', 'tmp', target);
    console.log('target: ', target);
  };
}
