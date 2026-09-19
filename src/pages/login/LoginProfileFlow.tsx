import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Brain,
  User,
  MapPin,
  Heart,
  Phone,
  Check,
  Sparkles,
} from 'lucide-react';
import { Language, Patient } from '../../types';
import { getTranslation } from '../../locales/translations';
import { voiceService } from '../../services/voiceService';

interface LoginProfileFlowProps {
  language: Language;
  patient: Patient;
  onComplete: (updates: Partial<Patient>) => void;
}

const NER_REGIONS = [
  'Assam', 'Meghalaya', 'Mizoram', 'Tripura', 'Manipur',
  'Nagaland', 'Arunachal Pradesh', 'Sikkim', 'West Bengal', 'Other',
];

const HEALTH_CONDITIONS = [
  { key: 'condDiabetes',      id: 'diabetes' },
  { key: 'condBloodPressure', id: 'blood_pressure' },
  { key: 'condHeart',         id: 'heart' },
  { key: 'condMemory',        id: 'memory' },
];

export const LoginProfileFlow: React.FC<LoginProfileFlowProps> = ({
  language,
  patient,
  onComplete,
}) => {
  const t = (key: string) => getTranslation(language, key);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [name, setName] = useState<string>(
    patient.name === 'Bhaben Baruah' ? '' : patient.name
  );

  // Step 2
  const [age, setAge]       = useState<number>(patient.age || 65);
  const [region, setRegion] = useState<string>(
    patient.region_code === 'NER-AS' ? '' : patient.region_code
  );
  const [showRegionDrop, setShowRegionDrop] = useState(false);

  // Step 3
  const [conditions, setConditions]     = useState<string[]>(patient.health_conditions || []);
  const [noneSelected, setNoneSelected] = useState<boolean>(
    (patient.health_conditions ?? []).length === 0
  );
  const [caregiverName, setCaregiverName] = useState<string>(
    patient.caregiver_name === 'Ananya Baruah' ? '' : patient.caregiver_name
  );
  const [caregiverPhone, setCaregiverPhone] = useState<string>(
    patient.caregiver_phone === '+91 94350 12345' ? '' : patient.caregiver_phone
  );

  const goNext = () => {
    voiceService.playGentleChime();
    setStep(prev => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
  };

  const goBack = () => {
    if (step > 1) setStep(prev => (prev - 1) as 1 | 2 | 3);
  };

  const toggleCondition = (id: string) => {
    setNoneSelected(false);
    setConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectNone = () => {
    setNoneSelected(true);
    setConditions([]);
  };

  const handleComplete = () => {
    voiceService.playSuccessChime();
    onComplete({
      name:              name.trim() || patient.name,
      age,
      region_code:       region || patient.region_code,
      health_conditions: noneSelected ? [] : conditions,
      caregiver_name:    caregiverName.trim() || patient.caregiver_name,
      caregiver_phone:   caregiverPhone.trim() || patient.caregiver_phone,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#060D1E] text-white flex flex-col items-center select-none relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="w-full max-w-lg flex items-center justify-between px-4 pt-6 pb-3 z-10">
        {step > 1 ? (
          <button onClick={goBack} aria-label="Back"
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-200 active:scale-95 transition-all hover:border-slate-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300">
          <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold tracking-wide">Cognitive Care</span>
        </div>
        <div className="text-xs font-bold text-slate-400 px-2">{step} {t('stepOf')} 3</div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-lg px-4 mb-4 z-10">
        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="w-full max-w-lg flex flex-col items-center justify-center flex-1 px-4 py-6 z-10 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-6">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight mb-2">
            {t('welcomeBack')}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg text-center mb-8 px-2 leading-snug">
            {t('profileSetupSub')}
          </p>
          <div className="w-full mb-6">
            <label className="block text-sm font-bold text-cyan-300 mb-2 ml-1">{t('yourName')}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={t('enterYourName')}
              className="w-full px-5 py-4 text-lg font-semibold rounded-2xl bg-[#0B1528] border-2 border-slate-700/70 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              autoComplete="name" />
          </div>
          <button onClick={goNext}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xl shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
            <span>{t('continue')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-6 text-xs text-slate-500 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 mr-1.5" />
            <span>{t('profileSetupTitle')}</span>
          </p>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="w-full max-w-lg flex flex-col items-center flex-1 px-4 py-4 z-10 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight mb-1">{t('tellUsAboutYou')}</h1>
          {name.trim() ? (
            <p className="text-cyan-400 text-base font-semibold mb-6">👋 {name.trim()}</p>
          ) : <div className="mb-6" />}

          {/* Age wheel */}
          <div className="w-full mb-7">
            <label className="block text-sm font-bold text-cyan-300 mb-3 ml-1">{t('yourAge')}</label>
            <div className="w-full flex items-center justify-center space-x-3 sm:space-x-4 py-2">
              <button onClick={() => setAge(prev => Math.max(40, prev - 1))} className="p-2 text-slate-400 hover:text-white active:scale-90">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <span className="text-slate-600 font-bold text-xl w-8 text-center">{age - 2}</span>
              <span className="text-slate-500 font-bold text-2xl w-8 text-center">{age - 1}</span>
              <div className="w-20 h-20 rounded-2xl bg-blue-600/30 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                <span className="text-4xl font-extrabold text-white">{age}</span>
              </div>
              <span className="text-slate-500 font-bold text-2xl w-8 text-center">{age + 1}</span>
              <span className="text-slate-600 font-bold text-xl w-8 text-center">{age + 2}</span>
              <button onClick={() => setAge(prev => Math.min(110, prev + 1))} className="p-2 text-slate-400 hover:text-white active:scale-90">
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Region picker */}
          <div className="w-full mb-8">
            <div className="flex items-center space-x-1.5 mb-2 ml-1">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <label className="text-sm font-bold text-cyan-300">{t('yourRegion')}</label>
              <span className="text-xs text-slate-500">{t('optionalField')}</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowRegionDrop(prev => !prev)}
                className="w-full px-5 py-4 text-base font-semibold rounded-2xl bg-[#0B1528] border-2 border-slate-700/70 text-left flex items-center justify-between focus:outline-none focus:border-cyan-400 active:scale-[0.99]">
                <span className={region ? 'text-white' : 'text-slate-500'}>{region || t('selectRegion')}</span>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showRegionDrop ? 'rotate-90' : ''}`} />
              </button>
              {showRegionDrop && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B1528] border-2 border-slate-700/70 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-52 overflow-y-auto">
                  {NER_REGIONS.map(r => (
                    <button key={r} onClick={() => { setRegion(r); setShowRegionDrop(false); }}
                      className={`w-full px-5 py-3.5 text-left text-base font-semibold hover:bg-blue-900/40 ${region === r ? 'text-cyan-400 bg-blue-900/30' : 'text-slate-200'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={goNext}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xl shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
            <span>{t('continue')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="w-full max-w-lg flex flex-col items-center flex-1 px-4 py-4 z-10 animate-fade-in overflow-y-auto">
          <div className="w-full flex items-center space-x-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-rose-900/40 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{t('healthInfo')}</h2>
              <p className="text-xs text-slate-400">{t('healthInfoSub')}</p>
            </div>
          </div>

          {/* Conditions */}
          <div className="w-full mb-5">
            <p className="text-sm font-bold text-cyan-300 mb-3">{t('healthConditions')}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {HEALTH_CONDITIONS.map(({ key, id }) => {
                const active = conditions.includes(id);
                return (
                  <button key={id} onClick={() => toggleCondition(id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.97] ${
                      active ? 'bg-blue-900/60 border-cyan-400 text-white' : 'bg-[#0B1528] border-slate-700/70 text-slate-300 hover:border-slate-500'}`}>
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-bold leading-snug pr-1">{t(key)}</span>
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              <button onClick={selectNone}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.97] col-span-2 ${
                  noneSelected ? 'bg-slate-800/80 border-slate-400 text-white' : 'bg-[#0B1528] border-slate-700/70 text-slate-400 hover:border-slate-500'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{t('condNone')}</span>
                  {noneSelected && (
                    <div className="w-5 h-5 rounded-full bg-slate-400 text-slate-950 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Caregiver */}
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              <p className="text-sm font-bold text-cyan-300">{t('caregiverNameLabel')}</p>
              <span className="text-xs text-slate-500">{t('optionalField')}</span>
            </div>
            <input type="text" value={caregiverName} onChange={e => setCaregiverName(e.target.value)}
              placeholder={t('caregiverNameLabel')}
              className="w-full px-5 py-3.5 text-base font-semibold rounded-2xl bg-[#0B1528] border-2 border-slate-700/70 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors mb-3" />
            <input type="tel" value={caregiverPhone} onChange={e => setCaregiverPhone(e.target.value)}
              placeholder={t('caregiverPhoneLabel')}
              className="w-full px-5 py-3.5 text-base font-semibold rounded-2xl bg-[#0B1528] border-2 border-slate-700/70 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors" />
          </div>

          <button onClick={handleComplete}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xl shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mb-6">
            <Check className="w-6 h-6 stroke-[3]" />
            <span>{t('letsBegin')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginProfileFlow;
