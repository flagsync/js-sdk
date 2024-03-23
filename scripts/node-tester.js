import { FlagSyncFactory as Legacy } from '../dist/legacy/index.js';
import { FlagSyncFactory as Modern } from '../dist/modern/index.js';

const PID = process.pid;
const NODE_VERSION = process.version;
const SDK_KEY = process.env.SDK_KEY;

console.log('PID:', PID);
console.log('NODE_VERSION:', NODE_VERSION);

const legacyFactory = Legacy({
  sdkKey: SDK_KEY,
  core: {
    key: 'mikechabot',
  },
  logLevel: 'DEBUG',
});

const modernFactory = Modern({
  sdkKey: SDK_KEY,
  core: {
    key: 'mikechabot',
  },
  logLevel: 'DEBUG',
});

Promise.allSettled([
  legacyFactory.client().waitForReadyCanThrow(),
  modernFactory.client().waitForReadyCanThrow(),
])
  .then((data) => {
    const [legacy, modern] = data;
    if (legacy.status === 'rejected') {
      console.log('Legacy failed');
      throw legacy.reason;
    }
    if (modern.status === 'rejected') {
      console.log('Modern failed');
      throw modern.reason;
    }
    process.exit(0);
    console.log('Success on ' + NODE_VERSION);
  })
  .catch((err) => {
    console.error(err);
    console.log('Failed on ' + NODE_VERSION);
    process.kill(PID, 'SIGTERM');
  });
