import { HttpClient, RequestParams } from '~api/clients/http-client';

import {
  SdkEnvironmentFlagsGetRequest,
  SdkEnvironmentFlagsGetResponse,
  SdkInitClientRequest,
} from '../data-contracts';

export class Sdk extends HttpClient {
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
    this.request<void>({
      path: `/sdk/init-client`,
      method: 'POST',
      body: data,
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
    this.request<SdkEnvironmentFlagsGetResponse>({
      path: `/sdk/flags`,
      method: 'POST',
      body: data,
      ...params,
    });
}
