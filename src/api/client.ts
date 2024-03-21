import { FlagSyncAPI } from './api';
import { FsSettings } from '../config/types';

let instance: FlagSyncAPI<null>;

export function apiClientFactory(params: FsSettings) {
  if (instance) {
    return instance;
  }

  instance = new FlagSyncAPI({
    baseUrl: params.urls.sdk,
    baseApiParams: {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-ridgeline-key': params.sdkKey,
      },
    },
  });

  return instance;
}
