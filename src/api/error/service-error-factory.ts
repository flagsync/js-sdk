import {
  FlagSyncErrorResponse,
  FsServiceError,
  ServiceErrorCode,
} from './service-error';

type ApiErrorResponse = {
  errorCode: ServiceErrorCode;
  message: string;
  statusCode: number;
  path: string;
};

function isApiErrorResponse(obj: any): obj is ApiErrorResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.errorCode === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.statusCode === 'number' &&
    typeof obj.path === 'string'
  );
}

export class ServiceErrorFactory {
  /**
   * Creates a ServiceError from a thrown object.
   *
   * @param e The thrown error object, which could be an Error or a Response.
   */
  static async create(e: unknown): Promise<FsServiceError> {
    if (e instanceof Response) {
      try {
        const data = await e.json();

        if (isApiErrorResponse(data)) {
          return this.createFromResponse(e.status, data);
        }
      } catch (jsonError) {
        // If parsing fails, we'll treat it as a generic error below.
      }

      return this.createGeneric(e);
    }

    if (e instanceof Error) {
      return this.createGeneric(e);
    }

    return new FsServiceError();
  }

  /**
   * Creates a ServiceError from a Response object with structured error data.
   * @param status The HTTP status code.
   * @param res The parsed JSON body of the error response.
   */
  private static createFromResponse(
    status: number,
    res: FlagSyncErrorResponse,
  ): FsServiceError {
    return new FsServiceError({
      statusCode: res.statusCode || status,
      errorCode: res.errorCode || ServiceErrorCode.UnknownError,
      message: res.message,
      path: res.path,
    });
  }

  /**
   * Creates a generic ServiceError from an unknown or Error object.
   * @param e The error object.
   */
  private static createGeneric(e: unknown): FsServiceError {
    const defaultMessage = 'An unknown error occurred.';
    const defaultStatusCode = 500;

    if (e instanceof Response) {
      return new FsServiceError({
        message: e.statusText || defaultMessage,
        path: '/',
        errorCode: ServiceErrorCode.UnknownError,
        statusCode: e.status || defaultStatusCode,
      });
    }

    if (e instanceof Error) {
      return new FsServiceError({
        message: e.message,
        path: '/',
        errorCode: ServiceErrorCode.UnknownError,
        statusCode: defaultStatusCode,
      });
    }

    // For any other unknown object, use the default message.
    return new FsServiceError({
      message: defaultMessage,
      path: '/',
      errorCode: ServiceErrorCode.UnknownError,
      statusCode: defaultStatusCode,
    });
  }
}
