export enum ErrorCode {
  // General errors
  Internal = 1000,
  Forbidden = 1001,
  ProductInsufficientStock = 1002,
  NotFound = 1003,
  ExceededLimit = 1004,
  Invalid = 1005,

  // Authentication errors
  NoToken = 4000,
  Unauthorized = 4001,
  InvalidToken = 4002,
  ExpiredToken = 4003,
  NotVerified = 4004,
  AlreadyVerified = 4005,
  InvalidUser = 4006,

  // Validation errors
  Validation = 5000,
  UniqueConstraintViolation = 5002,
}
