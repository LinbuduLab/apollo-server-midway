class Foo {
  public hasConfigRegisterd = (
    type: 'userConfigRegistration' | 'cliOptionRegistration'
  ): ((name: string) => boolean) => {
    return (name: string): boolean => {
      return Object.keys(this[type]).includes(name);
    };
  };
}

type RegistrationType = 'userConfigRegistration' | 'cliOptionRegistration';

type FuncReturnType<Arg, ReturnType> = (arg: Arg) => ReturnType;

class Bar {
  public hasConfigRegisterd(
    type: RegistrationType
  ): FuncReturnType<string, boolean> {
    return name => Object.keys(this[type]).includes(name);
  }
}
