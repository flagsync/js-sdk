import { AxiosError, isAxiosError } from 'axios';

import {
  FlagSyncErrorResponse,
  FsServiceError,
  ServiceErrorCode,
} from './service-error';

type WithData = {
  response: {
    data: FlagSyncErrorResponse;
  };
};

/**
 * Possible bug in Axios? The "isAxiosError" is not appearing on true
 * AxiosError objects from valid HTTP errors. This function is a workaround
 * to check if the error matches the AxiosError interface.
 * @param e
 */
function isDerivedAxiosError(e: unknown): e is AxiosError & WithData {
  return (
    (e as AxiosError)?.response?.data !== undefined &&
    (e as AxiosError)?.config !== undefined
  );
}

export class ServiceErrorFactory {
  /**
   * If the error is of type "Error" then either we encountered a JS error,
   * the service is down, or client's network is down. Essentially,
   * the browser is unable to contact the server.
   *
   * Otherwise, we got an error response from the server, so parse it.
   * @param e
   */
  static create(
    e: AxiosError<FlagSyncErrorResponse> | Error | unknown,
  ): FsServiceError {
    if (isAxiosError(e) && e.response?.data) {
      return this.createFromAxios(e, e.response.data);
    }
    if (isDerivedAxiosError(e)) {
      return this.createFromAxios(e, e.response.data);
    }
    return this.createGeneric(e);
  }

  /**
   * Certain endpoints respond with varying types of error status.
   * Use a mapper function if it's available, otherwise use the default mapper.
   * @param e
   * @param res
   */
  private static createFromAxios(
    e: AxiosError<FlagSyncErrorResponse>,
    res: FlagSyncErrorResponse,
  ) {
    const { statusCode } = res;
    if (statusCode) {
      return this.createDefault(e, res);
    }
    return this.createGeneric(e);
  }

  /**
   * Create ServiceError from AxiosHttpError
   * @param e
   * @param error
   * @private
   */
  private static createDefault(
    e: AxiosError<FlagSyncErrorResponse>,
    error: FlagSyncErrorResponse,
  ) {
    return new FsServiceError({
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
      path: error.path,
    });
  }

  /**
   * Create ServiceError from Error
   * @param e
   * @private
   */
  private static createGeneric(e: Error | unknown) {
    if (e instanceof Error) {
      return new FsServiceError({
        message: e.message,
        path: '/',
        errorCode: ServiceErrorCode.UnknownError,
        statusCode: 500,
      });
    }
    return new FsServiceError();
  }
}
