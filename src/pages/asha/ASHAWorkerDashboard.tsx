import React, { useState } from 'react';
import { Stethoscope, FileText, CheckCircle2, Wifi, WifiOff, Save, Plus, ArrowLeft, HeartPulse } from 'lucide-react';
import { Patient, Reminder, GameSession, ASHANote } from '../../types';
import { ashaRepository } from '../../repositories/ashaRepository';
import { syncRepository } from '../../repositories/syncRepository';
import { voiceService } from '../../services/voiceService';

interface ASHAWorkerDashboardProps {
  patient: Patient;
  reminders: Reminder[];
  sessions: GameSession[];
  onBackToPatient: () => void;
}

export const ASHAWorkerDashboard: React.FC<ASHAWorkerDashboardProps> = ({
  patient,
  reminders,
  sessions,
  onBackToPatient,
}) => {
  const [notes, setNotes] = useState<ASHANote[]>(ashaRepository.getNotes());
  const [newNoteText, setNewNoteText] = useState('');
  const [bp, setBp] = useState('122/80');
  const [pulse, setPulse] = useState('72');
  const [mood, setMood] = useState('Alert & calm');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOffline = syncRepository.isOffline();

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;

    const saved = ashaRepository.addNote({
      patient_id: patient.patient_id,
      worker_name: 'Priyanka Saikia (ASHA Supervisor)',
      note_text: newNoteText.trim(),
      vitals: { bp, pulse: `${pulse} bpm`, mood },
      timestamp: new Date().toISOString(),
    });

    setNotes([saved, ...notes]);
    setNewNoteText('');
    setSaveSuccess(true);
    voiceService.playSuccessChime();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-[#060D1E] text-white p-4 sm:p-6 pb-28 select-none animate-fade-in">
      <div className="w-full max-w-xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToPatient}
            className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2.5">
            <img src="/memora-logo.png" alt="Memora logo" className="w-9 h-9 object-contain rounded-xl p-1 bg-white/10 border border-teal-500/30" />
            <div className="text-left">
              <h1 className="text-lg font-bold leading-tight">ASHA Portal</h1>
              <p className="text-[10px] text-teal-300 font-semibold uppercase tracking-wider">Memora Health Network</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold">
            {isOffline ? (
              <span className="text-amber-400 flex items-center space-x-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Safe</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5" />
                <span>Sync Ready</span>
              </span>
            )}
          </div>
        </div>

        {/* Patient Summary Card */}
        <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-6 shadow-xl">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
            North Eastern Region Dementia Cohort
          </span>
          <div className="flex items-center justify-between mt-2 mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">{patient.name}</h2>
              <p className="text-xs text-slate-300">
                Age: {patient.age} • Region: Assam (NER) • Caregiver: {patient.caregiver_name}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
              Stable
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/60">
              <span className="text-xs text-slate-400 block">Medication</span>
              <span className="text-sm font-bold text-emerald-400">
                {reminders.filter(r => r.status === 'taken').length} / {reminders.length} Taken
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60">
              <span className="text-xs text-slate-400 block">Cognitive Sessions</span>
              <span className="text-sm font-bold text-cyan-400">{sessions.length} Active</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60">
              <span className="text-xs text-slate-400 block">Hydration</span>
              <span className="text-sm font-bold text-blue-400">{patient.water_intake} Glasses</span>
            </div>
          </div>
        </div>

        {/* Add Field Visit Note (Works Offline!) */}
        <div className="p-5 rounded-3xl bg-[#0F1E38] border border-blue-500/25 mb-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-rose-400" />
            <span>Record Field Visit & Vitals (Offline Enabled)</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Blood Pressure</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#142444] border border-slate-700 text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Pulse (bpm)</label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#142444] border border-slate-700 text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Observation</label>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#142444] border border-slate-700 text-white text-xs font-bold"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-slate-300 font-semibold mb-1 block">Clinical Observation Note</label>
            <textarea
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Conducted weekly follow-up. Shri Baruah participated in morning memory match. Water intake on schedule..."
              className="w-full p-3.5 rounded-2xl bg-[#142444] border border-slate-600 text-white text-sm focus:border-cyan-400 outline-none leading-relaxed"
            />
          </div>

          {saveSuccess && (
            <div className="p-3 mb-3 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-bold text-center animate-fade-in">
              ✓ Note saved to local device! Will automatically sync when connection is available.
            </div>
          )}

          <button
            onClick={handleSaveNote}
            disabled={!newNoteText.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-extrabold text-base shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Offline Note</span>
          </button>
        </div>

        {/* Previous Visit Notes History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
            Clinical Notes History
          </h3>
          {notes.map((note) => (
            <div
              key={note.note_id}
              className="p-4 rounded-2xl bg-[#0E1A33] border border-blue-500/15 text-xs shadow-md"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-cyan-300">{note.worker_name}</span>
                <span className="text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed mb-2">{note.note_text}</p>
              {note.vitals && (
                <div className="flex items-center space-x-4 text-[11px] text-teal-300 font-semibold pt-2 border-t border-slate-800">
                  <span>BP: {note.vitals.bp}</span>
                  <span>Pulse: {note.vitals.pulse}</span>
                  <span>Mood: {note.vitals.mood}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
