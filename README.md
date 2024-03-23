# FlagSync SDK for JavaScript

FlagSync is a feature management platform designed for simplicity. It supports feature flags, remote configurations, A/B testing, and controlled rollouts. Ideal for teams looking to integrate feature management without the complexity.

This SDK allows you to interact with the FlagSync API to retrieve feature flags and configurations.

[![npm version](https://badge.fury.io/js/%40flagsync%2Fjs-sdk.svg)](https://badge.fury.io/js/%40flagsync%2Fjs-sdk)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/flagsync.svg?style=social&label=Follow%20%40flagsync)](https://twitter.com/flagsync)

---
- [Compatibility](#compatibility)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Events](#events)
  - [Promises & async/await](#promises--asyncawait)
- [Get flag values](#get-flag-values)
- [Flag updates](#flag-updates)
- [Bootstrapping](#bootstrapping)
- [Additional configurations](#additional-configurations)

---
## Compatibility
This SDK is an isomorphic library capable of running on Node.js and web browsers. Compatible with Node.js 14+ and ES5.

## Installation

```bash
npm install @flagsync/js-sdk
yarn add @flagsync/js-sdk
pnpm add @flagsync/js-sdk
```

## Getting started

Instantiate the SDK and create a new FlagSync client:

```ts
import { FlagSyncFactory } from '@flagsync/js-sdk';

const factory = FlagSyncFactory({
  sdkKey: 'YOUR_SDK_KEY',
  core: {
    key: 'userId_0x123'
  },
});

const client = factory.client();
```
Once instantiated, there are two ways to observe the readiness of the SDK: events and promises. 


### Events


```ts
client.once(client.Event.SDK_READY, () => {
  // SDK is ready
  const value = client.flag<string>('my-flag')
});

client.once(client.Event.SDK_READY_FROM_STORE, () => {
  // Emitted once the SDK has loaded flags from LocalStorage.
  // Fires quickly since no network request is required.
  // This data may be stale, and should not be considered a replacement for the SDK_READY event
  const value = client.flag<string>('my-flag')
});
```

>💡 The `SDK_READY_FROM_STORE` event is useful for quickly loading flags from LocalStorage in Web browser environments.<br /><br />This event only fires when using the `localstorage` storage type; the default is `memory`.




### Promises & async/await
The SDK has two methods that return a promise for initialization, `waitForReady` and `waitForReadyCanThrow`. The former is identical to the `SDK_READY` event.

```ts
client
  .waitForReady()
  .then(() => {
    // SDK is ready
    const value = client.flag<string>('my-flag')
  })


// Or with await
await client.waitForReady();
const value = client.flag<string>('my-flag')
```

The other method, `waitForReadyCanThrow`, will throw an error if the SDK fails to initialize. This may be helpful in certain situations.
>💡 All client-facing errors are normalized to `FsServiceError` in the SDK.

```ts
client
  .waitForReadyCanThrow()
  .then(() => {
    // SDK is ready
    const value = client.flag<string>('my-flag')
  })
  .catch(e => {
    // Initialization failed
    const error = e as FsServiceError;
  });

// Or with await
try {
  await client.waitForReadyCanThrow();
  const value = client.flag<string>('my-flag')
} catch (e) {
  // Initialization failed
  const error = e as FsServiceError;
}
```

## Get flag values
Use the `flag` method to retrieve a flag value.
>💡 If the SDK is not ready, the method will return the default value, or `control` if one is not provided.

```ts
/**
 *   {
 *     "my-flag": "value-1"
 *   } 
 */

// SDK not ready
client.flag<string>('my-flag'); // 'control'
client.flag<string>('my-flag', 'value-2'); // 'value-2'

// SDK ready
client.flag<string>('my-flag'); // 'value-1'
client.flag<string>('my-flag', 'value-2'); // 'value-1'
```

## Flag Updates

The SDK automatically updates flags in the background. You can listen for updates using the `SDK_UPDATE` event.

```ts
client.on(client.Event.SDK_UPDATE, () => {
  // The SDK received an update
});
```

## Bootstrapping
You can initialize the SDK with a set of flags using the `bootstrap` configuration. This is useful for setting default values or for testing.

```ts

/**
 *   Remote configuration:
 *   {
 *     "my-flag": "value-1"
 *   }
 */

const factory = FlagSyncFactory({
    sdkKey: 'YOUR_SDK_KEY',
    core: {
      key: 'userId_0x123'
    },
    bootstrap: {
      'my-flag': 'value-2'
    }
});

client.flag<string>('my-flag'); // 'value-2'
await client.waitForReady();
client.flag<string>('my-flag'); // 'value-1'
```

## Additional configurations

```ts
export interface FlagSyncConfig {
  /**
   * The SDK key for the FlagSync project.
   */
  readonly sdkKey: string;
  /**
   * The core attributes for the SDK.
   */
  readonly core: {
    /**
     * The unique key for the user, or organization.
     */
    key: string;
    /**
     * The custom attributes for the user, or organization, which are
     * made available for rule targeting in your FlagSync dashboard.
     * > CustomAttributes: Record<string, CustomAttributeValue>
     *   Example: 
     *     {
     *       "email": "user@example.com"
     *       "jobTitle: "QA"
     *       "location": "Boston
     *     }     
     */
    attributes?: CustomAttributes;
  };
  /**
   * Initialize the SDK with a set of flags.
   * > FsFlagSet: Record<string, FsFlagValue>;
   */
  readonly bootstrap?: FsFlagSet;
  /**
   * The storage configuration for the SDK.
   * > StorageType: 'memory' | 'localstorage'
   */
  readonly storage?: {
    type?: StorageType;
    prefix?: string;
  };
  /**
   * The configuration for the SDK's sync mechanism.
   * > SyncType: 'stream' | 'poll' | 'off';
   */
  readonly sync?: {
    type?: SyncType;
    pollInterval?: number;
  };
  /**
   * The configuration for the SDK's logging.
   * > LogLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';
   */
  readonly logLevel?: LogLevel;
}
```
