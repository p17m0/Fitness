import { ApiClient } from './ApiClient';
import {
  AuthSuccessResponse,
  Booking,
  Coach,
  CreateBookingRequest,
  CreateClientSubscriptionRequest,
  CreateGymSlotRequest,
  Gym,
  GymSlot,
  LoginRequest,
  Product,
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

export class ProductsService {
  constructor(private readonly client: ApiClient) {}

  list() {
    return this.client.request<Product[]>('/api/v1/products');
  }
}

export class CoachSlotsService {
  constructor(private readonly client: ApiClient) {}

  list(coachId?: number) {
    const search = coachId ? `?coach_id=${coachId}` : '';
    return this.client.request<CoachSlot[]>(`/api/v1/coach_slots${search}`);
  }
}

export class ClientSubscriptionsService {
  constructor(private readonly client: ApiClient) {}

  list() {
    return this.client.request<ClientSubscription[]>('/api/v1/client_subscriptions');
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

  list() {
    return this.client.request<Booking[]>('/api/v1/bookings');
  }

  create(payload: CreateBookingRequest) {
    return this.client.request<Booking>('/api/v1/bookings', {
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



