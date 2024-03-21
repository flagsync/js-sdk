/**
 * Deeply merges two JavaScript objects with the specified interface.
 *
 * @param sourceObj
 * @param targetObj
 */
export function deepMerge<T>(
  sourceObj: Record<string, any>,
  targetObj: Record<string, any>,
): T {
  // TODO: maybe fix this? Ultimately we don't want users to add
  //       properties that don't exist in the interface, but this
  //       fucks up when trying to merge customAttributes, which allows
  //       the user to toss in anything they want, and the keys won't ever match
  // for (const key in targetObj) {
  //   if (!Object.prototype.hasOwnProperty.call(sourceObj, key)) {
  //     throw new Error(`Invalid key in user config: ${key}`);
  //   }
  // }

  const mergedConfig = { ...sourceObj };

  for (const key in targetObj) {
    if (key in mergedConfig) {
      if (typeof targetObj[key] === 'object' && targetObj[key] !== null) {
        mergedConfig[key] = deepMerge(mergedConfig[key] ?? {}, targetObj[key]); // Recursively merge nested objects
      } else {
        mergedConfig[key] = targetObj[key]; // Overwrite primitive values
      }
    } else {
      mergedConfig[key] = targetObj[key]; // Add new keys
    }
  }

  return mergedConfig as T;
}
