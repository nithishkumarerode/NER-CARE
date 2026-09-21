export type Language = 'en' | 'hi' | 'ta' | 'as' | 'bn' | 'lus';

export type UserRole = 'patient' | 'caregiver' | 'asha';

export type TextSize = 'normal' | 'large' | 'xlarge';

export interface Patient {
  patient_id: string;
  name: string;
  age: number;
  region_code: string;
  language_pref: Language;
  caregiver_name: string;
  caregiver_phone: string;
  text_size: TextSize;
  voice_enabled: boolean;
  high_contrast: boolean;
  reduce_time_pressure: boolean;
  water_intake: number;
  water_target: number;
  brain_age: number;
  gender?: string;
  mobile_number?: string;
  health_conditions?: string[];
  // 10 Health & Wellbeing fields
  sleep_duration?: string;
  physical_activity?: string;
  daily_independence?: string;
  memory_concern?: string;
  hearing_status?: string;
  vision_status?: string;
  social_engagement?: string;
  medication_routine?: string;
  caregiver_support?: string;
  comfort_preferences?: string[];
  created_at: string;
  updated_at: string;
}

export type GameType = 
  | 'memory_match' 
  | 'routine_recall' 
  | 'pattern_recognition' 
  | 'attention' 
  | 'object_recognition' 
  | 'emotion_recognition';

export interface GameSession {
  session_id: string;
  patient_id: string;
  game_type: GameType;
  score: number;
  accuracy: number; // 0 to 1
  reaction_time: number; // ms
  error_count: number;
  difficulty_level: number; // 1 to 3
  timestamp: string;
  sync_status: 'synced' | 'pending';
}

export type ReminderType = 
  | 'medicine' 
  | 'hydration' 
  | 'food' 
  | 'exercise' 
  | 'brain' 
  | 'appointment' 
  | 'sleep';

export interface Reminder {
  reminder_id: string;
  patient_id: string;
  type: ReminderType;
  title: string;
  time: string; // e.g. "10:30 AM"
  dosage?: string;
  scheduled_time: string;
  repeat_rule: string; // e.g. "Every day", "Morning & Evening"
  status: 'pending' | 'taken' | 'snoozed' | 'missed';
  acknowledgment_time?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncQueueItem {
  queue_id: string;
  entity_type: 'patient' | 'game_session' | 'reminder' | 'asha_note';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  created_at: string;
  retry_count: number;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface ASHANote {
  note_id: string;
  patient_id: string;
  worker_name: string;
  note_text: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    mood?: string;
  };
  timestamp: string;
  sync_status: 'synced' | 'pending';
}

export interface CognitiveProfile {
  overallScore: number;
  memoryScore: number;
  attentionScore: number;
  perceptionScore: number;
  reasoningScore: number;
  coordinationScore: number;
  unlockedPercentage: number;
  brainAge: number;
}
