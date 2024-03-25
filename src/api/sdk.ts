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
  SdkEnvironmentFlagGetRequest,
  SdkEnvironmentFlagGetResponse,
  SdkEnvironmentFlagsGetRequest,
  SdkEnvironmentFlagsGetResponse,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './clients/http-client';

export class Sdk<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkControllerInitContext
   * @request POST:/sdk/init
   */
  sdkControllerInitContext = (
    data: SdkEnvironmentFlagsGetRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/sdk/init`,
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
  /**
   * No description
   *
   * @name SdkControllerGetFlag
   * @request POST:/sdk/flag/{flagKey}
   */
  sdkControllerGetFlag = (
    flagKey: string,
    data: SdkEnvironmentFlagGetRequest,
    params: RequestParams = {},
  ) =>
    this.request<SdkEnvironmentFlagGetResponse, void>({
      path: `/sdk/flag/${flagKey}`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
