import { Patient, GameSession, Reminder, SyncQueueItem, ASHANote } from '../types';

const STORAGE_KEYS = {
  PATIENT: 'ner_care_patient_v1',
  GAME_SESSIONS: 'ner_care_game_sessions_v1',
  REMINDERS: 'ner_care_reminders_v1',
  SYNC_QUEUE: 'ner_care_sync_queue_v1',
  ASHA_NOTES: 'ner_care_asha_notes_v1',
  OFFLINE_MODE: 'ner_care_is_offline_simulated',
};

const DEFAULT_PATIENT: Patient = {
  patient_id: 'pat_ner_001',
  name: 'Bhaben Baruah',
  age: 72,
  region_code: 'NER-AS',
  language_pref: 'en',
  caregiver_name: 'Ananya Baruah',
  caregiver_phone: '+91 94350 12345',
  text_size: 'large',
  voice_enabled: true,
  high_contrast: false,
  reduce_time_pressure: true,
  water_intake: 3,
  water_target: 6,
  brain_age: 68,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_REMINDERS: Reminder[] = [
  {
    reminder_id: 'rem_01',
    patient_id: 'pat_ner_001',
    type: 'medicine',
    title: 'Blood Pressure & Memory Care',
    time: '10:30 AM',
    dosage: '1 Tablet after morning tea',
    repeat_rule: 'Every day',
    status: 'pending',
    scheduled_time: '10:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reminder_id: 'rem_02',
    patient_id: 'pat_ner_001',
    type: 'hydration',
    title: 'Drink Fresh Water (Glass 4)',
    time: '12:00 PM',
    dosage: '1 Full Glass (250ml)',
    repeat_rule: 'Hourly',
    status: 'pending',
    scheduled_time: '12:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reminder_id: 'rem_03',
    patient_id: 'pat_ner_001',
    type: 'brain',
    title: 'Daily Memory Match Exercise',
    time: '04:00 PM',
    dosage: '5 minutes',
    repeat_rule: 'Every afternoon',
    status: 'pending',
    scheduled_time: '16:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reminder_id: 'rem_04',
    patient_id: 'pat_ner_001',
    type: 'exercise',
    title: 'Gentle Garden Walk',
    time: '05:30 PM',
    dosage: '15 minutes light stroll',
    repeat_rule: 'Daily evening',
    status: 'pending',
    scheduled_time: '17:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const DEFAULT_SESSIONS: GameSession[] = [
  {
    session_id: 'sess_01',
    patient_id: 'pat_ner_001',
    game_type: 'memory_match',
    score: 85,
    accuracy: 0.88,
    reaction_time: 1420,
    error_count: 1,
    difficulty_level: 1,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    sync_status: 'synced',
  },
  {
    session_id: 'sess_02',
    patient_id: 'pat_ner_001',
    game_type: 'attention',
    score: 90,
    accuracy: 0.92,
    reaction_time: 1180,
    error_count: 0,
    difficulty_level: 1,
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    sync_status: 'synced',
  },
  {
    session_id: 'sess_03',
    patient_id: 'pat_ner_001',
    game_type: 'routine_recall',
    score: 80,
    accuracy: 0.82,
    reaction_time: 1850,
    error_count: 2,
    difficulty_level: 2,
    timestamp: new Date().toISOString(),
    sync_status: 'synced',
  }
];

const DEFAULT_ASHA_NOTES: ASHANote[] = [
  {
    note_id: 'asha_note_01',
    patient_id: 'pat_ner_001',
    worker_name: 'Priyanka Saikia (ASHA)',
    note_text: 'Visited Shri Bhaben Baruah at home. Alert and cheerful. Blood pressure is stable. Family confirms he completed his morning memory match and took morning medication on time.',
    vitals: { bp: '124/82', pulse: '74 bpm', mood: 'Calm & responsive' },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    sync_status: 'synced',
  }
];

export class LocalDatabase {
  public static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn('LocalDatabase read error for key:', key, e);
      return defaultValue;
    }
  }

  public static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalDatabase write error for key:', key, e);
    }
  }

  public static getPatient(): Patient {
    return this.getItem<Patient>(STORAGE_KEYS.PATIENT, DEFAULT_PATIENT);
  }

  public static savePatient(patient: Patient): void {
    this.setItem(STORAGE_KEYS.PATIENT, patient);
  }

  public static getReminders(): Reminder[] {
    return this.getItem<Reminder[]>(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
  }

  public static saveReminders(reminders: Reminder[]): void {
    this.setItem(STORAGE_KEYS.REMINDERS, reminders);
  }

  public static getSessions(): GameSession[] {
    return this.getItem<GameSession[]>(STORAGE_KEYS.GAME_SESSIONS, DEFAULT_SESSIONS);
  }

  public static saveSessions(sessions: GameSession[]): void {
    this.setItem(STORAGE_KEYS.GAME_SESSIONS, sessions);
  }

  public static getSyncQueue(): SyncQueueItem[] {
    return this.getItem<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  }

  public static saveSyncQueue(queue: SyncQueueItem[]): void {
    this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  public static getASHANotes(): ASHANote[] {
    return this.getItem<ASHANote[]>(STORAGE_KEYS.ASHA_NOTES, DEFAULT_ASHA_NOTES);
  }

  public static saveASHANotes(notes: ASHANote[]): void {
    this.setItem(STORAGE_KEYS.ASHA_NOTES, notes);
  }

  public static getIsOfflineSimulated(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.OFFLINE_MODE, false);
  }

  public static setIsOfflineSimulated(val: boolean): void {
    this.setItem(STORAGE_KEYS.OFFLINE_MODE, val);
  }
}
