import { FsServiceError, ServiceErrorCode } from '~api/error/service-error';

import { FsConfig } from './types';
import { FsSettings } from './types.internal';

export class ConfigValidator {
  /**
   * Validates the raw configuration before it's transformed into settings
   */
  static validateConfig(config: FsConfig): void {
    if (!config.core) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'core configuration is required',
      });
    }

    if (!config.core.key) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'core.key is required',
      });
    }
  }

  /**
   * Validates the transformed settings after merging with defaults
   */
  static validateSettings(settings: FsSettings): void {
    this.validateSdkKey(settings);
    this.validateTrackingSettings(settings);
    this.validateSyncSettings(settings);
    this.validateMetadata(settings);
  }

  private static validateSdkKey(settings: FsSettings): void {
    if (!settings.sdkKey) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'sdkKey is required',
      });
    }
  }

  private static validateTrackingSettings(settings: FsSettings): void {
    // Validate impressions settings
    if (settings.tracking.impressions.pushRate < 30) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'tracking.impressions.pushRate must be greater than 30',
      });
    }

    if (settings.tracking.impressions.maxQueueSize < 50) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'tracking.impressions.maxQueueSize must be greater than 50',
      });
    }

    // Validate events settings
    if (settings.tracking.events.pushRate < 30) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'tracking.events.pushRate must be greater than 30',
      });
    }

    if (settings.tracking.events.maxQueueSize < 50) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'tracking.events.maxQueueSize must be greater than 50',
      });
    }
  }

  private static validateSyncSettings(settings: FsSettings): void {
    if (settings.sync.pollRate < 30) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message: 'sync.pollRate must be greater than 30',
      });
    }
  }

  private static validateMetadata(settings: FsSettings): void {
    if (!settings.metadata.sdkName || !settings.metadata.sdkVersion) {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message:
          'Unable to determine SDK name or version. Please contact support.',
      });
    }
  }

  /**
   * Validates platform-specific settings
   */
  static validatePlatformSettings(settings: FsSettings): void {
    const platform = settings.platform;

    if (platform !== 'browser' && platform !== 'node') {
      throw new FsServiceError({
        errorCode: ServiceErrorCode.InvalidConfiguration,
        message:
          'Invalid platform setting. Must be either "browser" or "node".',
      });
    }

    // Add platform-specific validation rules here
    if (platform === 'browser') {
      this.validateBrowserSettings(settings);
    } else {
      this.validateNodeSettings(settings);
    }
  }

  private static validateBrowserSettings(settings: FsSettings): void {}

  private static validateNodeSettings(settings: FsSettings): void {}
}
