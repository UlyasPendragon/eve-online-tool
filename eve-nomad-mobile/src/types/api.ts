/**
 * EVE Nomad Mobile - API Type Definitions
 *
 * TypeScript interfaces for API requests and responses.
 */

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    subscriptionTier: 'free' | 'premium';
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  emailVerificationRequired: boolean;
}

// Character
export interface Character {
  id: string;
  characterId: number;
  characterName: string;
  corporationId: number;
  corporationName: string;
  allianceId?: number;
  allianceName?: string;
  securityStatus: number;
  birthday: string;
  totalSp: number;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterListResponse {
  characters: Character[];
}

// Skill Queue
export interface SkillQueueItem {
  skillId: number;
  skillName: string;
  queuePosition: number;
  finishedLevel: number;
  trainingStartSp: number;
  levelStartSp: number;
  levelEndSp: number;
  startDate?: string;
  finishDate?: string;
}

export interface SkillQueueResponse {
  skillQueue: SkillQueueItem[];
}

// Wallet
export interface WalletBalanceResponse {
  balance: number;
}

export interface WalletTransaction {
  transactionId: number;
  date: string;
  typeId: number;
  typeName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isBuy: boolean;
  clientId: number;
  clientName: string;
  locationId: number;
  locationName: string;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
}

// Market Orders
export interface MarketOrder {
  orderId: number;
  typeId: number;
  typeName: string;
  locationId: number;
  locationName: string;
  volumeTotal: number;
  volumeRemain: number;
  minVolume: number;
  price: number;
  isBuyOrder: boolean;
  duration: number;
  issued: string;
  range: string;
}

export interface MarketOrdersResponse {
  orders: MarketOrder[];
}

// User/Subscription
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  subscriptionTier: 'free' | 'premium';
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface UserResponse {
  user: User;
}
