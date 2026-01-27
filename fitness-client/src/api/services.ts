import { ApiClient } from './ApiClient';
import {
  AuthSuccessResponse,
  Booking,
  BookingQrResponse,
  Coach,
  CreateBookingRequest,
  CreateClientSubscriptionRequest,
  CreateCoachBookingRequest,
  CreateGymSlotRequest,
  Gym,
  GymSlot,
  LoginRequest,
  Program,
  RegisterRequest,
  ClientSubscription,
  SubscriptionPlan,
  CoachSlot
} from './types';

export class AuthService {
  constructor(private readonly client: ApiClient) {}

  register(payload: RegisterRequest) {
    return this.client.request<AuthSuccessResponse>('/api/v1/users', {
      method: 'POST',
      body: payload
    });
  }

  login(payload: LoginRequest) {
    return this.client.request<AuthSuccessResponse>('/api/v1/users/sign_in', {
      method: 'POST',
      body: payload
    });
  }

  logout() {
    return this.client.request<void>('/api/v1/users/sign_out', { method: 'DELETE' });
  }
}

export class GymsService {
  constructor(private readonly client: ApiClient) {}

  list() {
    return this.client.request<Gym[]>('/api/v1/gyms');
  }
}

export class CoachesService {
  constructor(private readonly client: ApiClient) {}

  list() {
    return this.client.request<Coach[]>('/api/v1/coaches');
  }
}

export class GymSlotsService {
  constructor(private readonly client: ApiClient) {}

  list(gymId?: number) {
    const search = gymId ? `?gym_id=${gymId}` : '';
    return this.client.request<GymSlot[]>(`/api/v1/gym_slots${search}`);
  }

  create(payload: CreateGymSlotRequest) {
    return this.client.request<GymSlot>('/api/v1/gym_slots', {
      method: 'POST',
      body: payload
    });
  }
}

export class ProgramsService {
  constructor(private readonly client: ApiClient) {}

  list() {
    return this.client.request<Program[]>('/api/v1/programs');
  }
}

export class SubscriptionPlansService {
  constructor(private readonly client: ApiClient) {}

  list() {
    return this.client.request<SubscriptionPlan[]>('/api/v1/subscription_plans');
  }
}

export class CoachSlotsService {
  constructor(private readonly client: ApiClient) {}

  list(params?: { coachId?: number; gymId?: number; startsAt?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.coachId) searchParams.set('coach_id', String(params.coachId));
    if (params?.gymId) searchParams.set('gym_id', String(params.gymId));
    if (params?.startsAt) searchParams.set('starts_at', params.startsAt);

    const search = searchParams.toString();
    return this.client.request<CoachSlot[]>(`/api/v1/coach_slots${search ? `?${search}` : ''}`);
  }
}

export class ClientSubscriptionsService {
  constructor(private readonly client: ApiClient) {}

  list(params?: { isExpired?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.isExpired) searchParams.set('is_expired', 'true');
    const search = searchParams.toString();
    return this.client.request<ClientSubscription[]>(
      `/api/v1/client_subscriptions${search ? `?${search}` : ''}`
    );
  }

  create(payload: CreateClientSubscriptionRequest) {
    return this.client.request<ClientSubscription>('/api/v1/client_subscriptions', {
      method: 'POST',
      body: payload
    });
  }
}

export class BookingsService {
  constructor(private readonly client: ApiClient) {}

  list(params?: { isExpired?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.isExpired) searchParams.set('is_expired', 'true');
    const search = searchParams.toString();
    return this.client.request<Booking[]>(`/api/v1/bookings${search ? `?${search}` : ''}`);
  }

  qr() {
    return this.client.request<BookingQrResponse>('/api/v1/bookings/qr');
  }

  create(payload: CreateBookingRequest) {
    return this.client.request<Booking>('/api/v1/bookings', {
      method: 'POST',
      body: payload
    });
  }

  createCoachBooking(bookingId: number, payload: CreateCoachBookingRequest) {
    return this.client.request<Booking>(`/api/v1/bookings/${bookingId}/create_coach_booking`, {
      method: 'POST',
      body: payload
    });
  }

  cancel(bookingId: number) {
    return this.client.request<void>(`/api/v1/bookings/${bookingId}`, {
      method: 'DELETE'
    });
  }
}



