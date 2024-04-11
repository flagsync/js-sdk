import { FsSettings } from '../../config/types';
import { Sdk } from '../sdk';
import { Track } from '../track';
import { Sse } from '../sse';

type ApiClient = {
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
