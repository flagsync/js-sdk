# FlagSync SDK for JavaScript

[![npm version](https://badge.fury.io/js/%40flagsync%2Fjavascript-sdk.svg)](https://badge.fury.io/js/%40flagsync%2Fjavascript-sdk)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/flagsync.svg?style=social&label=Follow%20%40flagsync)](https://twitter.com/flagsync)

## Compatibility
An isomorphic library capable of running on Node.js and web browsers. Compatible with Node.js versions 12+.

## Getting started

```bash
npm install @flagsync/js-sdk
yarn add @flagsync/js-sdk
pnpm add @flagsync/js-sdk
```
Below is a basic example of how to use the SDK. Please consult the documentation for additional details.

```javascript
import { FlagSyncFactory } from '@flagsync/js-sdk';

const factory = FlagSyncFactory({
  sdkKey: 'YOUR_SDK_KEY',
  core: {
    key: 'userId_0x123',
  },
});

const client = factory.client();

client.once(client.Event.SDK_READY, () => {
  console.log('client is ready');
});

client.once(client.Event.SDK_READY_FROM_STORE, () => {
  console.log('flag update received');
});

client.on(client.Event.SDK_UPDATE, () => {
  console.log('flag update received');
});
```
