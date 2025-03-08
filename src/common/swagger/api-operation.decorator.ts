import { ApiOperation, type ApiOperationOptions } from '@nestjs/swagger';

export function DocOperation(options?: ApiOperationOptions) {
  return (target: any, key: any, descriptor: PropertyDescriptor) => {
    ApiOperation({
      ...options,
      operationId: options?.operationId || `${target.constructor.name.replace('Controller', '')}_${key}`,
    })(target, key, descriptor as any);
    return descriptor;
  };
}
