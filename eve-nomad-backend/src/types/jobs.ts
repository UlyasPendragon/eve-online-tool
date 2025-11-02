/**
 * Job Types and Interfaces
 * Defines TypeScript types for all background job data payloads
 */

/**
 * Job Priority Levels
 */
export enum JobPriority {
  CRITICAL = 1, // Immediate execution (e.g., expired tokens)
  HIGH = 2, // Important but not urgent (e.g., user-requested data refresh)
  NORMAL = 3, // Standard operations (e.g., scheduled token refresh)
  LOW = 4, // Background maintenance (e.g., cache cleanup)
  BATCH = 5, // Large batch operations (e.g., historical data collection)
}

/**
 * Job Status
 */
export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
}

/**
 * Job Types
 */
export enum JobType {
  TOKEN_REFRESH = 'token-refresh',
  ESI_DATA_REFRESH = 'esi-data-refresh',
  HISTORICAL_DATA_COLLECTION = 'historical-data-collection',
  CACHE_CLEANUP = 'cache-cleanup',
  USER_NOTIFICATION = 'user-notification',
  ANALYTICS_PROCESSING = 'analytics-processing',
}

/**
 * Base Job Options
 */
export interface BaseJobOptions {
  priority?: JobPriority;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  delay?: number;
}

/**
 * Token Refresh Job Data
 */
export interface TokenRefreshJobData {
  characterId: number;
  userId: number;
  reason?: 'scheduled' | 'expired' | 'manual' | 'error';
  retryCount?: number;
}

/**
 * ESI Data Refresh Job Data
 */
export interface ESIDataRefreshJobData {
  characterId: number;
  userId: number;
  endpoint: string;
  params?: Record<string, unknown>;
  skipCache?: boolean;
  requestedBy?: 'user' | 'system' | 'scheduler';
}

/**
 * Historical Data Collection Job Data
 */
export interface HistoricalDataCollectionJobData {
  characterId: number;
  userId: number;
  dataType:
    | 'wallet_journal'
    | 'wallet_transactions'
    | 'market_orders'
    | 'industry_jobs'
    | 'skill_history';
  fromDate?: Date | string;
  toDate?: Date | string;
  batchSize?: number;
  pageToken?: string;
}

/**
 * Cache Cleanup Job Data
 */
export interface CacheCleanupJobData {
  type: 'expired' | 'lru' | 'pattern' | 'all';
  pattern?: string;
  maxAge?: number; // milliseconds
  maxSize?: number; // bytes
  dryRun?: boolean;
}

/**
 * User Notification Job Data
 */
export interface UserNotificationJobData {
  userId: number;
  type: 'push' | 'email' | 'in-app';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Analytics Processing Job Data
 */
export interface AnalyticsProcessingJobData {
  userId?: number;
  characterId?: number;
  eventType: string;
  timeRange: {
    from: Date | string;
    to: Date | string;
  };
  aggregationType?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

/**
 * Job Result Types
 */

export interface TokenRefreshJobResult {
  characterId: number;
  success: boolean;
  newTokenExpiry?: Date;
  error?: string;
  duration: number;
}

export interface ESIDataRefreshJobResult {
  characterId: number;
  endpoint: string;
  success: boolean;
  cached: boolean;
  statusCode?: number;
  error?: string;
  duration: number;
}

export interface HistoricalDataCollectionJobResult {
  characterId: number;
  dataType: string;
  recordsCollected: number;
  recordsStored: number;
  success: boolean;
  error?: string;
  nextPageToken?: string;
  duration: number;
}

export interface CacheCleanupJobResult {
  type: string;
  itemsRemoved: number;
  bytesFreed: number;
  duration: number;
  error?: string;
}

export interface UserNotificationJobResult {
  userId: number;
  type: string;
  sent: boolean;
  error?: string;
  duration: number;
}

export interface AnalyticsProcessingJobResult {
  eventType: string;
  recordsProcessed: number;
  success: boolean;
  error?: string;
  duration: number;
}

/**
 * Job Metrics
 */
export interface JobMetrics {
  jobType: JobType;
  status: JobStatus;
  count: number;
  avgDuration?: number;
  minDuration?: number;
  maxDuration?: number;
  failureRate?: number;
  lastRun?: Date;
}

/**
 * Queue Metrics
 */
export interface QueueMetrics {
  queueName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  total: number;
  completionRate?: number;
  failureRate?: number;
  avgProcessingTime?: number;
}

/**
 * Job Schedule Configuration
 */
export interface JobSchedule {
  jobType: JobType;
  cronExpression: string;
  enabled: boolean;
  timezone?: string;
  description?: string;
  jobData?: Record<string, unknown>;
  jobOptions?: BaseJobOptions;
}

/**
 * Dead Letter Queue Item
 */
export interface DeadLetterQueueItem {
  id: string;
  jobType: JobType;
  jobData: Record<string, unknown>;
  error: string;
  stackTrace?: string;
  attemptsMade: number;
  firstFailedAt: Date;
  lastFailedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}
