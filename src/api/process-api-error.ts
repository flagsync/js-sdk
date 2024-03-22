import { FsServiceError } from './service-error';
import { FlagSyncErrorResponse } from './types';
import { ServiceErrorFactory } from './service-error-factory';
import { HttpResponse } from './api-swagger';

export async function processApiError(e: unknown): Promise<FsServiceError> {
  let apiError: FsServiceError;

  if (e instanceof Response) {
    const response = e as HttpResponse<
      FlagSyncErrorResponse,
      FlagSyncErrorResponse
    >;
    try {
      if (response.error) {
        const error = response.error as FlagSyncErrorResponse;
        apiError = ServiceErrorFactory.createNew(error);
      } else {
        const error = (await response.json()) as FlagSyncErrorResponse;
        apiError = ServiceErrorFactory.createNew(error);
      }
    } catch (e: unknown) {
      apiError = ServiceErrorFactory.createNew(e as Error);
    }
  } else {
    apiError = ServiceErrorFactory.createNew(e as Error);
  }

  return apiError;
}
