export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: 'free' | 'pro';
  slug?: string;
  logo_url?: string;
  created_at: string;
}

export interface LoyaltyCard {
  id: string;
  restaurant_id: string;
  card_name: string;
  background_color: string;
  foreground_color: string;
  label_color: string;
  loyalty_type: 'points' | 'stamp';
  reward_description: string;
  points_per_visit: number;
  points_for_reward: number;
  stamp_total: number;
  stamp_per_visit: number;
  is_active: boolean;
  created_at: string;
}

export interface CardHolder {
  id: string;
  card_id: string;
  name?: string;
  phone?: string;
  email?: string;
  points: number;
  stamps: number;
  total_visits: number;
  total_rewards: number;
  serial_number: string;
  card_name: string;
  created_at: string;
}

export interface Scan {
  id: string;
  client_name: string;
  serial_number: string;
  loyalty_type: 'points' | 'stamp';
  card_name: string;
  points_earned: number;
  stamps_earned: number;
  reward_triggered: boolean;
  created_at: string;
}

export interface Stats {
  total_clients: number;
  total_scans: number;
  total_rewards: number;
}

export interface ScanResult {
  success: boolean;
  loyalty_type: 'points' | 'stamp';
  client: {
    name: string;
    points_before?: number;
    points_earned?: number;
    points_after?: number;
    points_goal?: number;
    stamps_before?: number;
    stamps_earned?: number;
    stamps_after?: number;
    stamps_total?: number;
    total_visits: number;
  };
  reward: {
    triggered: boolean;
    description?: string;
    message: string;
    points_remaining?: number;
    stamps_remaining?: number;
  };
}
