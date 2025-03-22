import { DynamicModule, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { S3Service } from './s3.service';
import { IConfig } from '../../config/config.interface';

@Module({})
export class StorageModule {
  static register({config}: {config: IConfig}): DynamicModule {
    return {
      module: StorageModule,
      providers: [
        {
          provide: IConfig,
          useValue: config,
        },
        StorageService,
        S3Service,
      ],
      controllers: [StorageController],
      exports: [StorageService, S3Service],
    };
  }
}
