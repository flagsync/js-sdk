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
  SdkTrackEventRequest,
  SdkTrackImpressionsRequest,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './clients/http-client';

export class Track<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkTrackControllerPostBatchEvents
   * @request POST:/track/events
   */
  sdkTrackControllerPostBatchEvents = (
    data: SdkTrackEventRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/track/events`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name SdkTrackControllerPostBatchImpressions
   * @request POST:/track/impressions
   */
  sdkTrackControllerPostBatchImpressions = (
    data: SdkTrackImpressionsRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/track/impressions`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
