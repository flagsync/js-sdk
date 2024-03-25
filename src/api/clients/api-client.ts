import { FsSettings } from '../../config/types';
import { Sdk } from '../sdk';
import { Events } from '../events';

type ApiClient = {
  sdk: Sdk<any>;
  events: Events<any>;
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
    events: new Events(apiParams),
  };

  return client;
}
