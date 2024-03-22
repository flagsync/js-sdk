export enum ServiceErrorCode {
  UnknownError = 'UNKNOWN_ERROR',
}

interface ServiceErrorInput {
  fnName?: string;
  message?: string;
  errorCode?: string;
  path?: string;
}

export class FsServiceError extends Error {
  public errorCode: ServiceErrorCode;
  public message: string;
  public path: string;

  constructor({
    message = undefined,
    errorCode = ServiceErrorCode.UnknownError,
    path = '/',
  }: ServiceErrorInput = {}) {
    super();

    this.name = errorCode;
    this.errorCode = errorCode as ServiceErrorCode;
    this.message = `[ServiceError]: ${message || errorCode}`;
    this.path = path;
  }
}
