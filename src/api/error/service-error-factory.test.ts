import { describe, expect, test } from 'vitest';

import { FlagSyncErrorResponse, ServiceErrorCode } from './service-error';
import { ServiceErrorFactory } from './service-error-factory';

export function createFakeResponse({
  status,
  statusText,
  data,
}: {
  status: number;
  statusText: string;
  data: any;
}): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('ServiceErrorFactory', () => {
  test('creates a generic ServiceError if the response has a status code of 500 but no data', async () => {
    const errorResponse = createFakeResponse({
      status: 500,
      statusText: 'Internal Server Error',
      data: undefined,
    });

    // Under test
    const e = await ServiceErrorFactory.create(errorResponse);

    expect(e.errorCode).toEqual(ServiceErrorCode.UnknownError);
    expect(e.statusCode).toEqual(500);
    expect(e.message).toEqual(
      '[FsServiceError]: status: 500, code: UNKNOWN_ERROR, msg: Internal Server Error',
    );
  });

  test('creates a generic ServiceError if the response has a status code of 500 but data is not valid JSON', async () => {
    const errorResponse = new Response('a string is not json', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'application/json' },
    });

    // Under test
    const e = await ServiceErrorFactory.create(errorResponse);

    expect(e.errorCode).toEqual(ServiceErrorCode.UnknownError);
    expect(e.statusCode).toEqual(500);
    expect(e.message).toEqual(
      '[FsServiceError]: status: 500, code: UNKNOWN_ERROR, msg: Internal Server Error',
    );
  });

  test('creates a generic ServiceError if an error is thrown without a response object', async () => {
    const e = await ServiceErrorFactory.create(new Error('Network error'));
    expect(e.errorCode).toEqual(ServiceErrorCode.UnknownError);
    expect(e.statusCode).toEqual(500);
    expect(e.message).toEqual(
      '[FsServiceError]: status: 500, code: UNKNOWN_ERROR, msg: Network error',
    );
  });

  test('creates a ServiceError if the response is a properly formed FlagSyncErrorResponse', async () => {
    const errorResponse = createFakeResponse({
      status: 503,
      statusText: 'SomeStatusText',
      data: {
        errorCode: 'TEST-123',
        message: 'Something went wrong',
        statusCode: 500,
        path: '/',
      } as unknown as FlagSyncErrorResponse,
    });

    // Under test
    const e = await ServiceErrorFactory.create(errorResponse);

    expect(e.errorCode).toEqual('TEST-123');
    expect(e.statusCode).toEqual(500);
    expect(e.message).toEqual(
      '[FsServiceError]: status: 500, code: TEST-123, msg: Something went wrong',
    );
  });
});
