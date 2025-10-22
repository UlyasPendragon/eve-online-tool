/**
 * TypeScript type definitions for ESI API responses
 * Based on https://esi.evetech.net/
 */

export interface ServerStatus {
  players: number;
  server_version: string;
  start_time: string;
  vip?: boolean;
}

export interface UniverseType {
  type_id: number;
  name: string;
  description: string;
  published: boolean;
  group_id: number;
  mass?: number;
  volume?: number;
  capacity?: number;
  portion_size?: number;
  radius?: number;
  graphic_id?: number;
  icon_id?: number;
  market_group_id?: number;
}

export interface SolarSystem {
  system_id: number;
  name: string;
  constellation_id: number;
  security_status: number;
  security_class?: string;
  star_id?: number;
  stargates?: number[];
  stations?: number[];
  planets?: Array<{
    planet_id: number;
    asteroid_belts?: number[];
    moons?: number[];
  }>;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface CharacterPublicInfo {
  name: string;
  corporation_id: number;
  birthday: string;
  gender: 'male' | 'female';
  race_id: number;
  bloodline_id: number;
  description?: string;
  alliance_id?: number;
  faction_id?: number;
  security_status?: number;
  title?: string;
}

export interface MarketPrice {
  type_id: number;
  average_price?: number;
  adjusted_price?: number;
}

export interface SkillQueueItem {
  skill_id: number;
  queue_position: number;
  finished_level: number;
  start_date?: string;
  finish_date?: string;
  training_start_sp?: number;
  level_start_sp?: number;
  level_end_sp?: number;
}

export interface CharacterSkills {
  skills: Array<{
    skill_id: number;
    active_skill_level: number;
    trained_skill_level: number;
    skillpoints_in_skill: number;
  }>;
  total_sp: number;
  unallocated_sp?: number;
}

export interface MailHeader {
  mail_id: number;
  subject: string;
  from: number;
  timestamp: string;
  is_read?: boolean;
  labels?: number[];
  recipients?: Array<{
    recipient_id: number;
    recipient_type: 'alliance' | 'character' | 'corporation' | 'mailing_list';
  }>;
}

export interface MarketOrder {
  order_id: number;
  type_id: number;
  location_id: number;
  volume_total: number;
  volume_remain: number;
  min_volume: number;
  price: number;
  is_buy_order: boolean;
  duration: number;
  issued: string;
  range: string;
}

export interface Asset {
  item_id: number;
  type_id: number;
  quantity: number;
  location_id: number;
  location_type: 'station' | 'solar_system' | 'other';
  location_flag: string;
  is_singleton: boolean;
  is_blueprint_copy?: boolean;
}

export interface IndustryJob {
  job_id: number;
  installer_id: number;
  facility_id: number;
  station_id: number;
  activity_id: number;
  blueprint_id: number;
  blueprint_type_id: number;
  blueprint_location_id: number;
  output_location_id: number;
  runs: number;
  cost?: number;
  licensed_runs?: number;
  probability?: number;
  product_type_id?: number;
  status: 'active' | 'cancelled' | 'delivered' | 'paused' | 'ready' | 'reverted';
  duration: number;
  start_date: string;
  end_date: string;
  pause_date?: string;
  completed_date?: string;
  completed_character_id?: number;
  successful_runs?: number;
}

export interface PlanetaryColony {
  planet_id: number;
  solar_system_id: number;
  planet_type: string;
  owner_id: number;
  last_update: string;
  upgrade_level: number;
  num_pins: number;
}
