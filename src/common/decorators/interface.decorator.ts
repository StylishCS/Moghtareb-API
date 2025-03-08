import { Inject } from "@nestjs/common";

export const createInterfaceDecorator = (name: string) => {
  const injector = Inject(name) as PropertyDecorator &
    ParameterDecorator & { interfaceName: string };
  injector.interfaceName = name;
  return injector;
};
