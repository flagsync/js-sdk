import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { beforeEach, describe, expect, test } from 'vitest';

import {
  FlagSyncErrorResponse,
  FsServiceError,
  ServiceErrorCode,
} from './service-error';
import { ServiceErrorFactory } from './service-error-factory';

export function createFakeResponse({
  status,
  statusText,
  data,
}: {
  status: number;
  statusText: string;
  data: any;
}): AxiosResponse {
  const headers = new AxiosHeaders();

  return {
    headers: {
      'Content-Type': 'application/json',
    },
    config: {
      headers: headers,
    },
    data,
    status,
    statusText,
  };
}

export function createFakeError({
  status,
  statusText,
  data,
  message,
}: {
  status: number;
  statusText: string;
  data: any;
  message: string;
}): AxiosError<any> {
  return {
    message,
    name: '',
    stack: new Error(message).toString(),
    response: createFakeResponse({ status, statusText, data }),
    isAxiosError: true,
    toJSON: () => ({}),
  };
}

function toEqualGenericServiceError(e: FsServiceError) {
  expect(e.errorCode).toEqual(ServiceErrorCode.UnknownError);
  expect(e.statusCode).toEqual(500);
  expect(e.message).toEqual(
    '[FsServiceError]: status: 500, code: UNKNOWN_ERROR, msg: Unknown error',
  );
}

describe('ServiceErrorFactory', () => {
  let fakeError = {} as AxiosError<any>;
  beforeEach(() => {
    fakeError = createFakeError({
      status: 500,
      statusText: 'Some Error',
      message: 'Request failed with status code 500',
      data: {},
    });
  });

  test('creates a generic ServiceError if not an axios error', () => {
    fakeError.isAxiosError = false;
    const e = ServiceErrorFactory.create(fakeError);
    toEqualGenericServiceError(e);
  });

  test('creates a generic ServiceError if an axios error but response is missing', () => {
    fakeError.response = undefined;
    const e = ServiceErrorFactory.create(fakeError);
    toEqualGenericServiceError(e);
  });

  test('creates a generic ServiceError if an axios error but data is missing on response', () => {
    fakeError.response!.data = undefined;
    const e = ServiceErrorFactory.create(fakeError);
    toEqualGenericServiceError(e);
  });

  test('creates a generic ServiceError if an axios error but errorStatus is missing on data', () => {
    fakeError.response!.data!.errorStatus = undefined;
    const e = ServiceErrorFactory.create(fakeError);
    toEqualGenericServiceError(e);
  });

  test('creates a ServiceError the response is a properly formed FlagSyncErrorResponse', () => {
    fakeError.response = createFakeResponse({
      status: 503,
      statusText: 'SomeStatusText',
      data: {
        errorCode: 'TEST-123',
        message: 'Something went wrong',
        statusCode: 500,
        path: '/',
      } as unknown as FlagSyncErrorResponse,
    });

    const e = ServiceErrorFactory.create(fakeError);

    expect(e.errorCode).toEqual('TEST-123');
    expect(e.statusCode).toEqual(500);
    expect(e.message).toEqual(
      '[FsServiceError]: status: 500, code: TEST-123, msg: Something went wrong',
    );
  });
});
