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

import { ContentType, HttpClient, RequestParams } from './clients/http-client';
import { SdkImpressionsPostRequest } from './data-contracts';

export class Events<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkEventControllerSse
   * @request GET:/events/sdk-updates
   */
  sdkEventControllerSse = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/events/sdk-updates`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @name SdkEventControllerPostBatchImpressions
   * @request POST:/events/impressions
   */
  sdkEventControllerPostBatchImpressions = (
    data: SdkImpressionsPostRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/events/impressions`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
