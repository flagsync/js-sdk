# FlagSync SDK for JavaScript

[![npm version](https://badge.fury.io/js/%40flagsync%2Fjs-sdk.svg)](https://badge.fury.io/js/%40flagsync%2Fjs-sdk)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/flagsync.svg?style=social&label=Follow%20%40flagsync)](https://twitter.com/flagsync)

FlagSync is a dead-simple feature management platform that allows you to manage feature flags, remote configurations, perform A/B experimentation, and manage rollouts for your applications. 

This SDK allows you to interact with the FlagSync API to retrieve feature flags and configurations.

```bash
npm install @flagsync/js-sdk
yarn add @flagsync/js-sdk
pnpm add @flagsync/js-sdk
```

## Compatibility
An isomorphic library capable of running on Node.js and web browsers. Compatible with Node.js versions 12+.

## Getting started

Below is the most basic example of how to use the SDK.

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
There are several ways to observe the readiness of the SDK.

### Events
```ts
client.once(client.Event.SDK_READY, () => {
  console.log('client is ready');
  const value = client.flag<string>('my-flag')
});
```
### Promises & async/await
The SDK has two methods of that return a promise for initialization. `waitForReady` and `waitForReadyCanThrow`.

```ts
client
  .waitForReady()
  .then(() => {
    const value = client.flag<string>('my-flag')
    // Work with the value
  })


// Or with await
await client.waitForReady();
const value = client.flag<string>('my-flag')
```

The other method, `waitForReadyCanThrow`, will throw an error if the SDK fails to initialize.
>💡 All client-facing errors are normalized to `FsServiceError` in the SDK.

```ts
client
  .waitForReadyCanThrow()
  .then(() => {
    const value = client.flag<string>('my-flag')
  })
  .catch(e => {
    const error = e as FsServiceError;
    console.error(error);
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

### Flag Updates
```ts
client.on(client.Event.SDK_UPDATE, () => {
  // The SDK received an update
});
```
