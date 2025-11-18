export type UploadStatus = 'uploaded' | 'validated' | 'processed';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Priority = 'high' | 'medium' | 'low';
export type InterventionStatus = 'suggested' | 'planned' | 'implemented' | 'archived';

export interface Upload {
  id: string;
  user_id: string;
  file_name: string;
  upload_date: string;
  total_responses: number;
  avg_score: number | null;
  status: UploadStatus;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  upload_id: string;
  team_name: string;
  enps_score: number | null;
  promoters_pct: number | null;
  passives_pct: number | null;
  detractors_pct: number | null;
  narrative: string | null;
  sentiment: Sentiment | null;
  key_themes: string[];
  quotes: string[];
  strengths: string[];
  concerns: string[];
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  user_id: string;
  story_id: string;
  team_name: string;
  title: string;
  description: string | null;
  priority: Priority;
  effort: number | null;
  impact: string | null;
  action_items: string[];
  status: InterventionStatus;
  implementation_time: string | null;
  created_at: string;
  updated_at: string;
}

export type Intervention = Action;

export interface CreateUploadInput {
  file_name: string;
  total_responses: number;
  avg_score?: number;
  status?: UploadStatus;
  raw_data?: any;
}

export interface CreateStoryInput {
  upload_id: string;
  team_name: string;
  enps_score?: number;
  narrative?: string;
  sentiment?: Sentiment;
  key_themes?: string[];
  quotes?: string[];
}

export interface CreateActionInput {
  story_id: string;
  team_name: string;
  title: string;
  description?: string;
  priority?: Priority;
  effort?: number;
  impact?: string;
  action_items?: string[];
  status?: InterventionStatus;
  implementation_time?: string;
}

export type CreateInterventionInput = CreateActionInput;
