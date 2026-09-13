import React, { useState } from 'react';
import { 
  MapPin, 
  PhoneCall, 
  Navigation, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Filter, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Search,
  Building2,
  Ambulance
} from 'lucide-react';
import { SupportedLanguage, IndianHospital } from '../types';
import { INDIAN_EMERGENCY_HOSPITALS } from '../mockData';

interface HospitalFinderPageProps {
  language: SupportedLanguage;
  onBackToTriage: () => void;
  onCallAmbulance: () => void;
}

export const HospitalFinderPage: React.FC<HospitalFinderPageProps> = ({
  language,
  onBackToTriage,
  onCallAmbulance
}) => {
  const isHindi = language === 'hi';
  const [filter, setFilter] = useState<'all' | 'gov' | 'pvt' | 'pmjay'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHospitals = INDIAN_EMERGENCY_HOSPITALS.filter((hosp) => {
    if (filter === 'gov' && !hosp.type.includes('Government')) return false;
    if (filter === 'pvt' && !hosp.type.includes('Private')) return false;
    if (filter === 'pmjay' && !hosp.pmjayCashless) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return hosp.name.toLowerCase().includes(q) || hosp.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToTriage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'वापस' : 'Back'}</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isHindi ? '24/7 आपातकालीन अस्पताल एवं कैजुअल्टी' : '24/7 Emergency Casualty & Trauma Centers'}
            </h2>
            <p className="text-xs text-slate-500">
              {isHindi 
                ? 'नजदीकी सरकारी एवं निजी अस्पताल, आईसीयू बेड एवं आपातकालीन टेलीफोन' 
                : 'Verified emergency rooms, ICU bed availability & direct hotlines in New Delhi'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCallAmbulance}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Ambulance className="w-4 h-4" />
          <span>{isHindi ? '102 एम्बुलेंस बुलाएं' : 'Dispatch 102 Ambulance'}</span>
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi ? 'अस्पताल का नाम या इलाका खोजें...' : 'Search hospital name or locality...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isHindi ? 'सभी अस्पताल' : 'All (6)'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('gov')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'gov' 
                ? 'bg-teal-700 text-white' 
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            {isHindi ? 'सरकारी (AIIMS/Safdarjung)' : 'Government (Free)'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('pvt')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'pvt' 
                ? 'bg-blue-700 text-white' 
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            {isHindi ? 'निजी सुपर स्पेशलिटी' : 'Private Super Speciality'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('pmjay')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'pmjay' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            {isHindi ? 'आयुष्मान PM-JAY' : 'PM-JAY Cashless'}
          </button>
        </div>

      </div>

      {/* Hospital List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Type and distance tag */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  hosp.type.includes('Government') 
                    ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {hosp.type}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{hosp.travelTimeMins} mins ({hosp.distanceKm} km)</span>
                </div>
              </div>

              {/* Hospital Name */}
              <h3 className="text-base font-black text-slate-900">{hosp.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{hosp.address}</span>
              </p>

              {/* Capabilities & Badges */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {hosp.hasTraumaLevel1 && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                    Level 1 Trauma Apex
                  </span>
                )}
                {hosp.hasCathLab && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    24/7 Cardiac Cath Lab
                  </span>
                )}
                {hosp.pmjayCashless && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                    Ayushman PM-JAY Cashless
                  </span>
                )}
              </div>

              {/* Real-time ICU & Casualty Status */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-emerald-800">
                    {hosp.icuBedsAvailable} ICU Beds Available
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">24/7 Casualty Open</span>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:${hosp.emergencyPhone}`}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call: {hosp.emergencyPhone}</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + hosp.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-teal-400" />
                <span>{isHindi ? 'रास्ता देखें' : 'Navigate GPS'}</span>
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
