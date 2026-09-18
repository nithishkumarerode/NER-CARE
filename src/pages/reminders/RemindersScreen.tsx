import React, { useState } from 'react';
import { Pill, Droplets, Utensils, Footprints, Brain, Calendar, Plus, Check, Clock, Bell, BellRing, ArrowLeft } from 'lucide-react';
import { Language, Reminder, ReminderType } from '../../types';
import { reminderRepository } from '../../repositories/reminderRepository';
import { voiceService } from '../../services/voiceService';
import { getTranslation } from '../../locales/translations';

interface RemindersScreenProps {
  language: Language;
  reminders: Reminder[];
  onTriggerAlarm: (reminder: Reminder) => void;
  onRemindersUpdate: (reminders: Reminder[]) => void;
  onBack?: () => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  language,
  reminders,
  onTriggerAlarm,
  onRemindersUpdate,
  onBack,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ReminderType>('medicine');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newDosage, setNewDosage] = useState('1 Tablet');

  const handleMarkTaken = (id: string) => {
    voiceService.playSuccessChime();
    reminderRepository.markStatus(id, 'taken');
    onRemindersUpdate(reminderRepository.getReminders());
    voiceService.speak('Reminder completed! Well done.', language);
  };

  const handleSnooze = (id: string) => {
    voiceService.playGentleChime();
    reminderRepository.snooze(id);
    onRemindersUpdate(reminderRepository.getReminders());
    voiceService.speak('Snoozed for 15 minutes.', language);
  };

  const handleSaveReminder = () => {
    if (!newTitle.trim()) return;

    reminderRepository.addReminder({
      patient_id: 'pat_ner_001',
      type: newType,
      title: newTitle.trim(),
      time: newTime,
      dosage: newDosage,
      repeat_rule: 'Every day',
      status: 'pending',
      scheduled_time: newTime,
    });

    onRemindersUpdate(reminderRepository.getReminders());
    setShowAddModal(false);
    setNewTitle('');
    voiceService.playSuccessChime();
  };

  const getTypeIcon = (type: ReminderType) => {
    switch (type) {
      case 'medicine':
        return <Pill className="w-8 h-8 text-emerald-400" />;
      case 'hydration':
        return <Droplets className="w-8 h-8 text-cyan-400" />;
      case 'food':
        return <Utensils className="w-8 h-8 text-amber-400" />;
      case 'exercise':
        return <Footprints className="w-8 h-8 text-blue-400" />;
      case 'brain':
        return <Brain className="w-8 h-8 text-purple-400" />;
      default:
        return <Calendar className="w-8 h-8 text-sky-400" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 select-none animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Reminders</h2>
            <p className="text-xs text-slate-300 mt-0.5">Gentle routine alerts</p>
          </div>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center space-x-1.5 shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add</span>
        </button>
      </div>

      {/* Reminder Cards List matching Requirement 22 */}
      <div className="space-y-3.5">
        {reminders.map((reminder) => (
          <div
            key={reminder.reminder_id}
            className={`p-5 rounded-3xl border-2 transition-all shadow-xl flex flex-col justify-between ${
              reminder.status === 'taken'
                ? 'bg-[#0B1728]/80 border-emerald-500/40 opacity-85'
                : 'bg-[#0E1A33] border-blue-500/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#132342] border border-blue-400/30 flex items-center justify-center shadow-inner">
                  {getTypeIcon(reminder.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{reminder.title}</h3>
                    {reminder.status === 'taken' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-[10px] font-extrabold text-emerald-300">
                        ✓ Taken
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{reminder.dosage || 'Standard dose'}</p>
                </div>
              </div>

              {/* Instant Alarm Test Trigger */}
              <button
                onClick={() => onTriggerAlarm(reminder)}
                title="Test full screen alarm"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 active:scale-90"
              >
                <BellRing className="w-4 h-4" />
              </button>
            </div>

            {/* Time & Recurrence Info */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-4">
              <span className="flex items-center space-x-1.5 font-bold text-cyan-300 text-sm">
                <Clock className="w-4 h-4" />
                <span>{reminder.time}</span>
              </span>
              <span>{reminder.repeat_rule}</span>
            </div>

            {/* Action Buttons: [Taken] [Snooze] matching Requirement 22 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleMarkTaken(reminder.reminder_id)}
                className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-1.5 active:scale-98 transition-all ${
                  reminder.status === 'taken'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{getTranslation(language, 'taken')}</span>
              </button>

              <button
                onClick={() => handleSnooze(reminder.reminder_id)}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold text-sm flex items-center justify-center space-x-1.5 active:scale-98 transition-all"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{getTranslation(language, 'snooze')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0F1E38] border border-blue-400/40 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Schedule New Reminder</h3>

            <div className="space-y-3.5 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Title / Medication</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Evening Vitamin"
                  className="w-full px-4 py-3 rounded-xl bg-[#142444] border border-slate-600 text-white text-sm focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ReminderType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#142444] border border-slate-600 text-white text-xs outline-none"
                  >
                    <option value="medicine">💊 Medicine</option>
                    <option value="hydration">💧 Hydration</option>
                    <option value="food">🍎 Food</option>
                    <option value="exercise">🚶 Walk</option>
                    <option value="brain">🧠 Game</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#142444] border border-slate-600 text-white text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReminder}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
