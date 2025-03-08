// deno-lint-ignore-file no-explicit-any

import { BadRequestException } from '@nestjs/common';

import type { UploadOptions } from '../options';
import type { StorageFile } from '../../storage';
import { getParts, type THonoRequest } from '../request';
import { filterUpload } from '../filter';

export const handleMultipartSingleFile = async (req: THonoRequest, fieldname: string, options: UploadOptions) => {
  const parts = getParts(req, options);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: Record<string, any> = {};

  let file: StorageFile | undefined = undefined;

  const removeFiles = async (error?: boolean) => {
    if (file == null) return;
    await options.storage?.removeFile(file, error);
  };

  try {
    for await (const [partFieldName, part] of Object.entries(parts)) {
      if (!(part instanceof File)) {
        body[partFieldName] = part;
        continue;
      }

      if (partFieldName !== fieldname) {
        throw new BadRequestException(`Field ${partFieldName} doesn't accept file`);
      }
      if (file != null) {
        throw new BadRequestException(`Field ${fieldname} accepts only one file`);
      }

      const _file = await options.storage!.handleFile(part, req, partFieldName);

      if (await filterUpload(options, req, _file)) {
        file = _file;
      }
    }
  } catch (error) {
    await removeFiles(true);
    throw error;
  }

  return {
    body,
    file,
    remove: () => removeFiles(),
  };
};
