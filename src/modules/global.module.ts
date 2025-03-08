import {
  Module,
  type DynamicModule,
  type ModuleMetadata,
} from "@nestjs/common";

@Module({})
export class GlobalModule {
  static register(metadata: ModuleMetadata): DynamicModule {
    return {
      module: GlobalModule,
      ...metadata,
      global: true,
    };
  }
}
