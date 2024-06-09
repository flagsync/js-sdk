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
  SdkClientTrackEventRequest,
  SdkClientTrackImpressionsRequest,
  SdkServerTrackEventRequest,
  SdkServerTrackImpressionsRequest,
} from './data-contracts';

export class Track<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkTrackControllerPostClientBatchEvents
   * @request POST:/track/events/client
   */
  sdkTrackControllerPostClientBatchEvents = (
    data: SdkClientTrackEventRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/track/events/client`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @name SdkTrackControllerPostClientBatchImpressions
   * @request POST:/track/impressions/client
   */
  sdkTrackControllerPostClientBatchImpressions = (
    data: SdkClientTrackImpressionsRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/track/impressions/client`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
