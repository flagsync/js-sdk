import { FsSettings } from '~config/types.internal';

import { Sdk } from '~api/sdk';
import { Sse } from '~api/sse';
import { Track } from '~api/track';

export type ApiClient = {
  sdk: Sdk<any>;
  sse: Sse<any>;
  track: Track<any>;
};

let client: ApiClient;

export function apiClientFactory(params: FsSettings) {
  if (client) {
    return client;
  }

  const apiParams = {
    baseURL: params.urls.sdk,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'x-ridgeline-key': params.sdkKey,
    },
  };

  client = {
    sdk: new Sdk(apiParams),
    sse: new Sse(apiParams),
    track: new Track(apiParams),
  };

  return client;
}
