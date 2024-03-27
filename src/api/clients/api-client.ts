import { FsSettings } from '../../config/types';
import { Sdk } from '../sdk';
import { Events } from '../events';
import { Impressions } from '../error/impressions';

type ApiClient = {
  sdk: Sdk<any>;
  events: Events<any>;
  impressions: Impressions<any>;
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
    impressions: new Impressions(apiParams),
  };

  return client;
}
