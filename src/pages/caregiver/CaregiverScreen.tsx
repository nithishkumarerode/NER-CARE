import React, { useState } from 'react';
import { Users, Phone, ShieldCheck, Heart, Plus, Bell, Calendar, Activity, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Language, Patient, Reminder, GameSession } from '../../types';
import { getTranslation } from '../../locales/translations';
import { reminderRepository } from '../../repositories/reminderRepository';
import { voiceService } from '../../services/voiceService';

interface CaregiverScreenProps {
  language: Language;
  patient: Patient;
  reminders: Reminder[];
  sessions: GameSession[];
  onAddReminder: (newReminder: any) => void;
  onPatientUpdate: (patient: Patient) => void;
}

export const CaregiverScreen: React.FC<CaregiverScreenProps> = ({
  language,
  patient,
  reminders,
  sessions,
  onAddReminder,
  onPatientUpdate,
}) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'family' | 'compliance'>('family');

  const handleCallCaregiver = () => {
    voiceService.speak(`Calling your caregiver ${patient.caregiver_name}`, language);
    window.open(`tel:${patient.caregiver_phone}`);
  };

  const handleSaveMember = () => {
    if (!newMemberName.trim()) return;
    onPatientUpdate({
      ...patient,
      caregiver_name: newMemberName,
      caregiver_phone: newMemberPhone || patient.caregiver_phone,
    });
    setShowAddMemberModal(false);
    voiceService.playSuccessChime();
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 pt-2 select-none animate-fade-in">
      {/* Header with Memora branding */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 px-2.5 py-0.5 rounded-full bg-teal-950/60 border border-teal-500/30">
              Memora Caregiver Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getTranslation(language, 'friendsAndFamily')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {getTranslation(language, 'friendsFamilySub')}
          </p>
        </div>
        <img src="/memora-logo.png" alt="Memora logo" className="w-10 h-10 object-contain rounded-xl p-1 bg-white/10 border border-white/20 shrink-0" />
      </div>

      {/* Mode Selector Pill */}
      <div className="w-full flex p-1 rounded-2xl bg-[#0E1A33] border border-blue-500/20 mb-5">
        <button
          onClick={() => setActiveTab('family')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'family' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Family Circle
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'compliance' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Caregiver Report
        </button>
      </div>

      {activeTab === 'family' ? (
        <>
          {/* Avatar Row matching Page 21 */}
          <div className="p-5 rounded-3xl bg-[#0C1933] border border-blue-500/25 mb-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              All Members
            </h3>

            <div className="flex items-center space-x-6">
              {/* You Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 to-sky-500 border-2 border-white/60 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {patient.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-200 mt-2">You</span>
              </div>

              {/* Caregiver Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-pink-500 border-2 border-pink-400 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {patient.caregiver_name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-200 mt-2 line-clamp-1 max-w-[70px]">
                  {patient.caregiver_name.split(' ')[0]}
                </span>
              </div>

              {/* Add Button matching Page 21 */}
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex flex-col items-center group active:scale-95 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-[#0080FF] hover:bg-[#006CD9] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Plus className="w-8 h-8 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-cyan-300 mt-2">Add</span>
              </button>
            </div>
          </div>

          {/* Connected Caregiver Contact Card */}
          <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 mb-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                  ✓ Primary Caregiver
                </span>
                <h4 className="text-xl font-bold text-white mt-2">{patient.caregiver_name}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{patient.caregiver_phone}</p>
              </div>

              <button
                onClick={handleCallCaregiver}
                className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center active:scale-95 transition-all shadow-lg"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Next Session Spotlight Card matching Page 21 */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#122548] to-[#0D1B36] border border-blue-400/30 shadow-xl flex items-center justify-between">
            <div className="pr-3">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                NEXT SESSION
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Personalized Brain Training
              </h4>
              <p className="text-xs text-slate-300 mt-1">Shared with your family circle</p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-900/40 border border-blue-400/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🏋️‍♂️
            </div>
          </div>
        </>
      ) : (
        /* CAREGIVER COMPLIANCE DASHBOARD */
        <div className="space-y-4">
          {/* Calm Alert Banner */}
          <div className="p-4 rounded-2xl bg-blue-950/70 border border-blue-500/40 flex items-start space-x-3 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Daily Medication & Hydration Safe</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Last activity completed 18 mins ago. Memory score within optimal baseline.
              </p>
            </div>
          </div>

          {/* Medication Compliance List */}
          <div className="p-5 rounded-3xl bg-[#0E1A33] border border-blue-500/20 shadow-xl">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Today's Schedule & Adherence
            </h4>
            <div className="space-y-2.5">
              {reminders.map((r) => (
                <div
                  key={r.reminder_id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{r.type === 'medicine' ? '💊' : '💧'}</span>
                    <div>
                      <p className="font-bold text-white">{r.title}</p>
                      <p className="text-slate-400">{r.time} • {r.repeat_rule}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full font-bold ${
                      r.status === 'taken'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}
                  >
                    {r.status === 'taken' ? '✓ Taken' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding a new family member matching Page 20 style */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0F1E38] border border-blue-400/40 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Connect Family Member</h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Dr. Baruah"
                  className="w-full px-4 py-3 rounded-xl bg-[#142444] border border-slate-600 text-white text-base focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="+91 ..."
                  className="w-full px-4 py-3 rounded-xl bg-[#142444] border border-slate-600 text-white text-base focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md"
              >
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
