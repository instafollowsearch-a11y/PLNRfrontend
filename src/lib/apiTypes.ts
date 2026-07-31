import type { PlanTypeSlug } from '../constants/planFlowConfig';

export type SuggestionPayload = {
  name: string;
  description: string;
  estimated_cost_per_person?: number;
  estimated_cost?: number;
  estimated_cost_total?: number;
  estimated_gas_cost?: number;
  estimated_food_cost?: number;
  total_drive_time?: string;
  time_slot?: string;
  venues?: string[];
  highlights?: string[];
  stops?: Array<{
    name: string;
    closing_time?: string;
    duration?: string;
  }>;
};

export type Suggestion = {
  id: number;
  payload: SuggestionPayload;
  selected_at: string | null;
};

export type ItineraryStop = {
  time: string;
  name: string;
  activity: string;
  notes: string;
  venue_url?: string;
  maps_url?: string;
  external_url?: string;
};

export type ItineraryDay = {
  date: string;
  theme: string;
  stops: ItineraryStop[];
};

export type ItineraryContent = {
  title: string;
  summary: string;
  stops?: ItineraryStop[];
  days?: ItineraryDay[];
};

export type PlanSession = {
  uuid: string;
  status: string;
  city: string | null;
  recipient_phone?: string | null;
  answers: Record<string, unknown>;
  plan_type?: { slug: PlanTypeSlug; label: string };
  refinement_messages?: Array<{ role: string; content: string; created_at: string }>;
  suggestions?: Suggestion[];
  itinerary?: {
    id: number;
    content: ItineraryContent;
    email_sent_at: string | null;
  } | null;
  created_at?: string;
};

export type UserRole = 'user' | 'admin';

export type User = {
  id: number;
  name: string;
  email: string;
  city: string | null;
  role: UserRole;
};

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
};
