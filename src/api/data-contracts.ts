/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SdkUserContext {
  key: string;
  attributes?: object;
}

export interface SdkEnvironmentFlagsGetRequest {
  context: SdkUserContext;
}

export interface SdkEnvironmentFlagsGetResponse {
  flags: object;
  context: SdkUserContext;
}

export interface SdkEnvironmentFlagGetRequest {
  context: SdkUserContext;
}

export interface SdkEnvironmentFlagGetResponse {
  flag: object;
  context: SdkUserContext;
}

export interface SdkTrackEvent {
  eventKey: string;
  value?: number | null;
  properties?: object | null;
  timestamp: string;
}

export interface SdkTrackEventRequest {
  context: SdkUserContext;
  events: SdkTrackEvent[];
}

export interface SdkTrackImpression {
  flagKey: string;
  flagValue: object;
  timestamp: string;
}

export interface SdkTrackImpressionsRequest {
  impressions: SdkTrackImpression[];
  context: SdkUserContext;
}
