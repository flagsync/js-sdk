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
import { HttpClient, RequestParams } from '~api/clients/http-client';

export class Sse<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkSseControllerSseClient
   * @request GET:/sse/sdk-updates/client
   */
  sdkSseControllerSseClient = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/sse/sdk-updates/client`,
      method: 'GET',
      ...params,
    });
}
