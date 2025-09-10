import { HttpClient, RequestParams } from '~api/clients/http-client';

import {
  SdkClientTrackEventRequest,
  SdkClientTrackImpressionsRequest,
} from '../data-contracts';

export class Track extends HttpClient {
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
    this.request<void>({
      path: `/track/events/client`,
      method: 'POST',
      body: data,
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
    this.request<void>({
      path: `/track/impressions/client`,
      method: 'POST',
      body: data,
      ...params,
    });
}
