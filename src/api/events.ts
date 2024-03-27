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
}
