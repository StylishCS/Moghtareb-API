import { SupportedMime } from '../enums/supported-mime.enum';
import { UploadType } from '../enums/upload-type.enum';

export class IUploadingImage {
  type: UploadType;
  mime: SupportedMime;
}
