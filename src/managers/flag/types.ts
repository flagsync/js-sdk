import type { FsFlagSet } from '~config/types';

export interface FeatureFlags {}

export type IsFeatureFlagsEmpty<T> = keyof T extends never ? true : false;
export declare const NoExplicitReturn: unique symbol;
export type NoExplicitReturnType = typeof NoExplicitReturn;

export type FlagReturnType<TReturn, TKey extends string, TFeatureFlags> =
  IsFeatureFlagsEmpty<TFeatureFlags> extends true
    ? TReturn extends NoExplicitReturnType
      ? unknown
      : TReturn
    : TKey extends keyof TFeatureFlags
      ? TFeatureFlags[TKey]
      : never;

export interface IFlagManager {
  flag<T>(flagKey: string, defaultValue?: T): T;
  flags: (defaultValues?: FsFlagSet) => FsFlagSet;
}

export interface FeatureFlags {}

export type TypedFeatureFlags = keyof FeatureFlags extends never
  ? Record<string, unknown>
  : { [K in keyof FeatureFlags]: FeatureFlags[K] };

export type FlagKey = keyof TypedFeatureFlags;
