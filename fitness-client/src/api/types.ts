export type BookingStatus = 'booked' | 'cancelled';
export type SlotStatus = 'available' | 'booked' | 'cancelled';
export type SubscriptionStatus = 'active' | 'expired';

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface Coach {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  specialization?: string;
  bio?: string;
}

export interface Gym {
  id: number;
  name: string;
  address: string;
  description?: string | null;
  capacity: number;
}

export interface GymSlot {
  id: number;
  gym_id: number;
  starts_at: string;
  ends_at: string;
  status: SlotStatus;
}

export interface Program {
  id: number;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price_cents: number;
  currency: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string | null;
  visits_count: number;
  duration_days: number;
  price_cents: number;
  currency: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  purchasable_type: string;
  purchasable_id: number;
}

export interface CoachSlot {
  id: number;
  coach_id: number;
  gym_slot_id?: number | null;
  starts_at: string;
  ends_at: string;
  status: SlotStatus;
}

export interface ClientSubscription {
  id: number;
  subscription_plan_id: number;
  remaining_visits: number;
  expires_at?: string | null;
  status: SubscriptionStatus;
}

export interface Booking {
  id: number;
  gym_slot_id: number;
  coach_slot_id?: number | null;
  status: BookingStatus;
}

export interface AuthSuccessResponse {
  status: 'success';
  user: User;
  token: string;
}

export interface RegisterRequest {
  user: {
    email: string;
    phone_number: string;
    password: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface LoginRequest {
  user: {
    email?: string;
    phone_number?: string;
    password: string;
  };
}

export interface CreateGymSlotRequest {
  gym_slot: {
    gym_id: number;
    starts_at: string;
    ends_at: string;
  };
}

export interface CreateBookingRequest {
  booking: {
    gym_slot_id: number;
    coach_slot_id?: number;
  };
}

export interface CreateClientSubscriptionRequest {
  client_subscription: {
    subscription_plan_id: number;
  };
}



