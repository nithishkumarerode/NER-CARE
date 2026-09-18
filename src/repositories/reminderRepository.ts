import { LocalDatabase } from '../database/localDatabase';
import { Reminder } from '../types';
import { syncRepository } from './syncRepository';

export class ReminderRepository {
  public getReminders(): Reminder[] {
    return LocalDatabase.getReminders();
  }

  public getNextReminder(): Reminder | null {
    const reminders = this.getReminders();
    const pending = reminders.filter(r => r.status === 'pending');
    return pending.length > 0 ? pending[0] : (reminders[0] || null);
  }

  public addReminder(reminder: Omit<Reminder, 'reminder_id' | 'created_at' | 'updated_at'>): Reminder {
    const reminders = this.getReminders();
    const newReminder: Reminder = {
      ...reminder,
      reminder_id: 'rem_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newReminder, ...reminders];
    LocalDatabase.saveReminders(updated);
    syncRepository.enqueue('reminder', newReminder.reminder_id, 'create', newReminder);
    return newReminder;
  }

  public markStatus(reminderId: string, status: Reminder['status']): Reminder | null {
    const reminders = this.getReminders();
    let target: Reminder | null = null;
    const updated = reminders.map(r => {
      if (r.reminder_id === reminderId) {
        target = {
          ...r,
          status,
          acknowledgment_time: status === 'taken' ? new Date().toISOString() : r.acknowledgment_time,
          updated_at: new Date().toISOString(),
        };
        return target;
      }
      return r;
    });

    if (target) {
      LocalDatabase.saveReminders(updated);
      syncRepository.enqueue('reminder', reminderId, 'update', target);
    }
    return target;
  }

  public snooze(reminderId: string): Reminder | null {
    return this.markStatus(reminderId, 'snoozed');
  }
}

export const reminderRepository = new ReminderRepository();
