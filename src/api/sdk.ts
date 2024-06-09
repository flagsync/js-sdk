/* eslint-disable */

/* tslint:disable */

/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */
import {
  ContentType,
  HttpClient,
  RequestParams,
} from '~api/clients/http-client';

import {
  SdkEnvironmentFlagsGetRequest,
  SdkEnvironmentFlagsGetResponse,
  SdkInitClientRequest,
} from './data-contracts';

export class Sdk<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkControllerInitClientContext
   * @request POST:/sdk/init-client
   */
  sdkControllerInitClientContext = (
    data: SdkInitClientRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/sdk/init-client`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @name SdkControllerGetFlags
   * @request POST:/sdk/flags
   */
  sdkControllerGetFlags = (
    data: SdkEnvironmentFlagsGetRequest,
    params: RequestParams = {},
  ) =>
    this.request<SdkEnvironmentFlagsGetResponse, void>({
      path: `/sdk/flags`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
