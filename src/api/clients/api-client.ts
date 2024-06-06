import { FsSettings } from '~config/types.internal';

import { Sdk } from '~api/sdk';
import { Sse } from '~api/sse';
import { Track } from '~api/track';

export class ApiClientFactory {
  private readonly sdk: Sdk<any>;
  private readonly sse: Sse<any>;
  private readonly track: Track<any>;

  constructor(params: FsSettings) {
    const apiParams = {
      baseURL: params.urls.sdk,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'x-ridgeline-key': params.sdkKey,
      },
    };

    this.sdk = new Sdk(apiParams);
    this.sse = new Sse(apiParams);
    this.track = new Track(apiParams);
  }

  public getSdk(): Sdk<any> {
    return this.sdk;
  }

  public getSse(): Sse<any> {
    return this.sse;
  }

  public getTrack(): Track<any> {
    return this.track;
  }
}
