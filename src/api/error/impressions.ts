import { ContentType, HttpClient, RequestParams } from '../clients/http-client';
import { SdkImpressionsPostRequest } from '../data-contracts';

export class Impressions<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkImpressionsControllerPostBatchImpressions
   * @request POST:/impressions
   */
  sdkImpressionsControllerPostBatchImpressions = (
    data: SdkImpressionsPostRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/impressions`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
