export enum ServiceErrorCode {
  AmqpParseError = 'AMQP_PARSE_ERROR',
  AmqpHandlerError = 'AMQP_HANDLER_ERROR',
  AmqpInvalidMessagePayload = 'AMQP_INVALID_MESSAGE_PAYLOAD',
  AmqpInvalidQueueActionType = 'AMQP_INVALID_QUEUE_ACTION_TYPE',
  AmqpUnknownError = 'AMQP_ERROR_UNKNOWN',
  ApiKeyNotFound = 'API_KEY_NOT_FOUND',
  JwtNotFound = 'JWT_NOT_FOUND',
  JwtInvalid = 'JWT_INVALID',
  FlagNotFound = 'FLAG_NOT_FOUND',
  FlagStateNotFound = 'FLAG_STATE_NOT_FOUND',
  InvalidSdkKey = 'INVALID_SDK_KEY',
  MissingApiKeyValues = 'MISSING_API_KEY_VALUES',
  UnknownError = 'UNKNOWN_ERROR',
  UnsupportedVariantDataType = 'UNSUPPORTED_VARIANT_DATA_TYPE',
  UserContextNotFound = 'USER_CONTEXT_NOT_FOUND',
  VariantNotFound = 'VARIANT_NOT_FOUND',
  ValidationGuard = 'VALIDATION_GUARD',
}
export type FlagSyncErrorResponse = {
  path: string;
  message: string;
  statusCode: number;
  errorCode: ServiceErrorCode;
};

interface ServiceErrorInput {
  errorCode?: ServiceErrorCode;
  statusCode?: number;
  message?: string;
  path?: string;
}

export class FsServiceError extends Error {
  public errorCode: ServiceErrorCode;
  public statusCode: number;
  public message: string;
  public path: string;

  constructor({
    errorCode = ServiceErrorCode.UnknownError,
    statusCode = 500,
    path = '/',
    message = 'Unknown error',
  }: ServiceErrorInput = {}) {
    super();
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.message = `[FsServiceError]: status: ${statusCode}, code: ${errorCode}, msg: ${message}`;
    this.path = path;
  }
}
