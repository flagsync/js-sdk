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

export interface SdkImpression {
  flagKey: string;
  flagValue: object;
}

export interface SdkUserContext {
  key: string;
  email?: string;
  custom?: object;
}

export interface SdkImpressionsPostRequest {
  impressions: SdkImpression[];
  context: SdkUserContext;
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
