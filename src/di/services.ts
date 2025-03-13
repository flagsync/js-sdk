export const ServiceKeys = {
  ApiClient: 'apiClient' as const,
  EventManager: 'eventManager' as const,
  SyncManager: 'syncManager' as const,
  StorageManager: 'storageManager' as const,
  TrackManager: 'trackManager' as const,
  FlagManager: 'flagManager' as const,
  ServiceManager: 'serviceManager' as const,
  KillManager: 'killManager' as const,
} as const;

export type ServiceKey = (typeof ServiceKeys)[keyof typeof ServiceKeys];
