import type { FsSettings } from '~config/types.internal';

import { Sdk } from '~api/clients/sdk-client';
import { Track } from '~api/clients/track-client';

export type ApiClientFactory = {
  sdk: Sdk;
  track: Track;
};

let client: ApiClientFactory;

export function apiClientFactory(params: FsSettings) {
  if (client) {
    return client;
  }

  client = {
    sdk: new Sdk({
      baseURL: params.urls.flags,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-ridgeline-key': params.sdkKey,
      },
    }),
    track: new Track({
      baseURL: params.urls.events,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-ridgeline-key': params.sdkKey,
      },
    }),
  };

  return client;
}
