export enum ServiceErrorCode {
  InvalidSdkKey = 'INVALID_SDK_KEY',
  InvalidConfiguration = 'INVALID_CONFIGURATION',
  UnknownError = 'UNKNOWN_ERROR',
  UserContextNotFound = 'USER_CONTEXT_NOT_FOUND',
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
