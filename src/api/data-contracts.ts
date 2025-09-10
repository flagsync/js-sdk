export interface SdkUserContext {
  key: string;
  attributes?: object;
}

export interface SdkSdkContext {
  sdkName: string;
  sdkVersion: string;
}

export interface SdkInitClientRequest {
  context: SdkUserContext;
  sdkContext: SdkSdkContext;
}

export interface SdkEnvironmentFlagsGetRequest {
  context: SdkUserContext;
}

export interface SdkEnvironmentFlagsGetResponse {
  flags: object;
  context: SdkUserContext;
}

export interface SdkClientTrackEvent {
  eventKey: string;
  value?: number | null;
  properties?: object | null;
  timestamp: string;
}

export interface SdkClientTrackEventRequest {
  context: SdkUserContext;
  events: SdkClientTrackEvent[];
  sdkContext: SdkSdkContext;
}

export interface SdkClientTrackImpression {
  flagKey: string;
  flagValue: object;
  timestamp: string;
}

export interface SdkClientTrackImpressionsRequest {
  impressions: SdkClientTrackImpression[];
  context: SdkUserContext;
  sdkContext: SdkSdkContext;
}
