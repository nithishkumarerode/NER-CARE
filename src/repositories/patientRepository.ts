import { LocalDatabase } from '../database/localDatabase';
import { Patient, TextSize, Language } from '../types';
import { syncRepository } from './syncRepository';

export class PatientRepository {
  public getPatient(): Patient {
    return LocalDatabase.getPatient();
  }

  public updatePatient(updates: Partial<Patient>): Patient {
    const current = this.getPatient();
    const updated: Patient = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    LocalDatabase.savePatient(updated);

    // Queue for sync
    syncRepository.enqueue('patient', updated.patient_id, 'update', updated);
    return updated;
  }

  public incrementWater(): Patient {
    const patient = this.getPatient();
    const newIntake = Math.min(patient.water_intake + 1, patient.water_target);
    return this.updatePatient({ water_intake: newIntake });
  }

  public resetWater(): Patient {
    return this.updatePatient({ water_intake: 0 });
  }

  public updateTextSize(textSize: TextSize): Patient {
    return this.updatePatient({ text_size: textSize });
  }

  public updateLanguage(lang: Language): Patient {
    return this.updatePatient({ language_pref: lang });
  }
}

export const patientRepository = new PatientRepository();
