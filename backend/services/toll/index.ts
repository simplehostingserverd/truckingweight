/**
 * Toll Services Index
 * Exports all toll-related services and types
 */

// Base service and types
export { BaseTollService } from './BaseTollService';
export type {
  TollProviderConfig,
  RouteRequest,
  TollCalculation,
  TollPoint,
  AccountInfo,
  Transaction,
  SyncResult,
} from './BaseTollService';

// Individual provider services
export { PCMilerService } from './PCMilerService';
export type { PCMilerConfig } from './PCMilerService';

export { IPassService } from './IPassService';
export type { IPassConfig } from './IPassService';

export { BestPassService } from './BestPassService';
export type { BestPassConfig } from './BestPassService';

export { PrePassService } from './PrePassService';
export type { PrePassConfig } from './PrePassService';

// Factory and utilities
export { TollServiceFactory } from './TollServiceFactory';
export type { TollProviderType, TollProviderCredentials } from './TollServiceFactory';

// Re-export everything for convenience
export default {
  BaseTollService,
  PCMilerService,
  IPassService,
  BestPassService,
  PrePassService,
  TollServiceFactory,
};
