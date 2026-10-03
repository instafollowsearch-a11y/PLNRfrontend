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
  itinerary_content?: ItineraryContent | null;
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
  photo_url?: string;
  hours?: string;
  cost_per_person?: number;
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

export type PlanAccessRole = 'owner' | 'viewer' | 'guest';

export type PlanSharedBy = {
  name: string;
  email: string;
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
  access_role?: PlanAccessRole | null;
  shared_by?: PlanSharedBy | null;
  created_at?: string;
};

export type UserRole = 'user' | 'admin';

export type ProStatus = 'inactive' | 'active' | 'past_due' | 'canceled';

export type User = {
  id: number;
  name: string;
  email: string;
  city: string | null;
  interests?: string[];
  role: UserRole;
  is_pro?: boolean;
  pro_status?: ProStatus;
  pro_current_period_end?: string | null;
};

export type BillingConfig = {
  pro_monthly_price_cents: number;
  pro_currency: string;
  app_store_url: string | null;
  play_store_url: string | null;
  web_app_url: string | null;
  stripe_fake?: boolean;
  stripe_configured?: boolean;
};

export type WeekendRecommendationItem = {
  event_id: number;
  title: string;
  venue: string | null;
  starts_at: string | null;
  day?: string | null;
  url: string | null;
  image_url?: string | null;
  source?: string | null;
  reason: string;
};

export type SaturdayPlanStop = {
  time: string;
  name: string;
  detail: string;
};

export type SaturdayPlan = {
  title: string;
  summary: string;
  stops: SaturdayPlanStop[];
};

export type WeekendRecommendation = {
  uuid: string;
  city: string;
  interests: string[];
  window_start: string | null;
  window_end: string | null;
  items: WeekendRecommendationItem[];
  saturday_plan?: SaturdayPlan | null;
  email_sent_at: string | null;
  created_at?: string;
};

export type PlanSharePreview = {
  token: string;
  status: string;
  invitee_email: string;
  account_exists: boolean;
  inviter_name: string | null;
  plan: {
    uuid: string;
    city: string | null;
    status: string;
    plan_type: { slug: string; label: string };
  };
  urls: { web: string | null; app: string };
  app_store_url: string | null;
  play_store_url: string | null;
  expires_at: string | null;
};

export type PlanShareRecord = {
  token: string;
  invitee_email: string;
  status: string;
  expires_at: string | null;
};

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
};
