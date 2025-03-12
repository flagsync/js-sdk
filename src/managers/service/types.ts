export interface IServiceManager {
  /**
   * Initializes the SDK with error catching. If an error occurs, it will be emitted
   * through the event manager but won't throw.
   * @returns A promise that resolves when initialization is complete
   */
  initWithCatch: Promise<void>;
  /**
   * Initializes the SDK and throws any errors that occur during initialization.
   * @returns A promise that resolves when initialization is complete
   * @throws {FsServiceError} If initialization fails
   */
  initWithWithThrow: Promise<void>;
}
