export enum SupportedMime {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp',
  PDF = 'application/pdf',
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
  OGG = 'video/ogg',
  AVI = 'video/x-msvideo',
  MOV = 'video/quicktime',
}

export const IMAGE_MIME = [SupportedMime.JPEG, SupportedMime.PNG, SupportedMime.WEBP];

export const VIDEO_MIME = [
  SupportedMime.MP4,
  SupportedMime.WEBM,
  SupportedMime.OGG,
  SupportedMime.AVI,
  SupportedMime.MOV,
];
