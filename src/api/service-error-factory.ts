import { FsServiceError } from './service-error';
import { FlagSyncErrorResponse } from './types';

export class ServiceErrorFactory {
  /**
   * If the error is of type "Error" then either we encountered a JS error,
   * the service is down, or client's network is down. Essentially,
   * the browser is unable to contact the server.
   *
   * Otherwise, we got an error response from the server, so parse it.
   * @param e
   */
  static createNew(e: FlagSyncErrorResponse | Error): FsServiceError {
    if (e instanceof Error) {
      return this.createGenericNew(e);
    }
    return this.createErrorFromApiResponse(e);
  }

  private static createErrorFromApiResponse(e: FlagSyncErrorResponse) {
    return new FsServiceError({
      errorCode: e.message,
      path: e.path,
    });
  }

  /**
   * Create ServiceError from Error
   * @param e
   * @private
   */
  private static createGenericNew(e: Error) {
    return new FsServiceError({ message: e.message });
  }
}
