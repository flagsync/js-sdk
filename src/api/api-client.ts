import { FsSettings } from '../config/types';
import { Sdk } from './Sdk';

let instance: Sdk<any>;

export function apiClientFactory(params: FsSettings) {
  if (instance) {
    return instance;
  }
  instance = new Sdk({
    baseURL: params.urls.sdk,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'x-ridgeline-key': params.sdkKey,
    },
  });

  return instance;
}
