const { FlagSyncFactory } = require('../../dist/legacy/index.cjs');

const PID = process.pid;
const NODE_VERSION = process.version;
const SDK_KEY = process.env.SDK_KEY;

console.log('PID:', PID);
console.log('NODE_VERSION:', NODE_VERSION);

const factory = FlagSyncFactory({
  sdkKey: SDK_KEY,
  core: {
    key: 'mikechabot',
  },
  sync: {
    type: 'off',
  },
  logLevel: 'DEBUG',
});

factory
  .client()
  .waitForReadyCanThrow()
  .then(() => {
    process.exit(0);
    console.log('Success on ' + NODE_VERSION);
  })
  .catch((err) => {
    console.error(err);
    console.error('Failed on ' + NODE_VERSION);
    process.kill(PID, 'SIGTERM');
  });
