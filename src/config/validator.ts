import { FsServiceError, ServiceErrorCode } from '~api/error/service-error';

import type { FsConfig } from './types';
import type { FsSettings } from './types.internal';

interface ValidationRule {
  validate: (settings: FsSettings) => boolean;
  message: string;
}

export class ConfigValidator {
  private static rules: ValidationRule[] = [
    {
      validate: (settings) => Boolean(settings.sdkKey),
      message: 'sdkKey is required',
    },
    {
      validate: (settings) => Boolean(settings.core?.key),
      message: 'core.key is required',
    },
    {
      validate: (settings) => settings.tracking.impressions.pushRateInSec >= 30,
      message: 'tracking.impressions.pushRateInSec must be >= 30',
    },
    {
      validate: (settings) => settings.tracking.impressions.maxQueueSize >= 50,
      message: 'tracking.impressions.maxQueueSize must be >= 50',
    },
    {
      validate: (settings) => settings.tracking.events.pushRateInSec >= 30,
      message: 'tracking.events.pushRateInSec must be >= 30',
    },
    {
      validate: (settings) => settings.tracking.events.maxQueueSize >= 50,
      message: 'tracking.events.maxQueueSize must be >= 50',
    },
    {
      validate: (settings) => settings.sync.pollRateInSec >= 30,
      message: 'sync.pollRateInSec must be >= 30',
    },
    {
      validate: (settings) =>
        Boolean(settings.metadata.sdkName && settings.metadata.sdkVersion),
      message:
        'Unable to determine SDK name or version. Please contact support.',
    },
    {
      validate: (settings) => ['browser', 'node'].includes(settings.platform),
      message: 'Invalid platform setting. Must be either "browser" or "node".',
    },
  ];

  private static configRules: ValidationRule[] = [
    {
      validate: (config) => Boolean(config.core),
      message: 'core configuration is required',
    },
    {
      validate: (config) => Boolean(config.core?.key),
      message: 'core.key is required',
    },
  ];

  public static validate(settings: FsSettings): void {
    for (const rule of this.rules) {
      if (!rule.validate(settings)) {
        throw new FsServiceError({
          errorCode: ServiceErrorCode.InvalidConfiguration,
          message: rule.message,
        });
      }
    }
  }

  public static validateConfig(config: FsConfig): void {
    for (const rule of this.configRules) {
      if (!rule.validate(config as any)) {
        throw new FsServiceError({
          errorCode: ServiceErrorCode.InvalidConfiguration,
          message: rule.message,
        });
      }
    }
  }

  public static addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  public static addConfigRule(rule: ValidationRule): void {
    this.configRules.push(rule);
  }
}
