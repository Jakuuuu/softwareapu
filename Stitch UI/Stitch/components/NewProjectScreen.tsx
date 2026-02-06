import React, { useState } from 'react';
import { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const NewProjectScreen: React.FC<Props> = ({ onNavigate }) => {
  const [workType, setWorkType] = useState('building');

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800">
        <button className="text-slate-900 dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">New Project</h1>
        <button className="flex w-12 items-center justify-end text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          Cancel
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-6 pb-28 overflow-y-auto no-scrollbar">
        {/* Section 1: Identification */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Identification</h2>
          </div>
          <div className="space-y-4">
            {/* Project Name */}
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Project Name</span>
              <input 
                className="form-input w-full rounded-lg border-gray-300 bg-surface-light dark:bg-surface-dark dark:border-gray-700 focus:border-primary focus:ring-primary h-12 px-4 shadow-sm text-base transition-shadow" 
                placeholder="e.g. Riverside Complex Phase 1" 
                type="text" 
              />
            </label>
            {/* Location */}
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Location</span>
              <div className="relative flex items-center">
                <input 
                  className="form-input w-full rounded-lg border-gray-300 bg-surface-light dark:bg-surface-dark dark:border-gray-700 focus:border-primary focus:ring-primary h-12 pl-4 pr-12 shadow-sm text-base transition-shadow" 
                  placeholder="City, State or Coordinates" 
                  type="text" 
                />
                <button className="absolute right-2 p-2 text-primary hover:text-blue-700 transition-colors">
                  <span className="material-symbols-outlined">location_on</span>
                </button>
              </div>
            </label>
            {/* Owner */}
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Owner / Client</span>
              <input 
                className="form-input w-full rounded-lg border-gray-300 bg-surface-light dark:bg-surface-dark dark:border-gray-700 focus:border-primary focus:ring-primary h-12 px-4 shadow-sm text-base transition-shadow" 
                placeholder="Client Name" 
                type="text" 
              />
            </label>
          </div>
        </section>

        {/* Section 2: Type of Work */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary text-[20px]">category</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type of Work</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'building', label: 'Building', icon: 'apartment' },
              { id: 'roadwork', label: 'Roadwork', icon: 'add_road' },
              { id: 'hospital', label: 'Hospital', icon: 'local_hospital' },
              { id: 'sierra', label: 'Sierra', icon: 'landscape' },
            ].map((type) => (
              <label key={type.id} className="cursor-pointer group relative">
                <input 
                  checked={workType === type.id} 
                  onChange={() => setWorkType(type.id)}
                  className="peer sr-only" 
                  name="work_type" 
                  type="radio" 
                />
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all h-28">
                  <span className="material-symbols-outlined text-3xl mb-2 text-gray-400 group-hover:text-primary peer-checked:text-primary transition-colors">
                    {type.icon}
                  </span>
                  <span className="text-sm font-medium text-center text-slate-700 dark:text-slate-200 peer-checked:text-primary">
                    {type.label}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 text-primary transition-opacity">
                  <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section 3: Global Factors */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">settings</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Global Factors</h2>
            </div>
          </div>
          <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 font-medium">Base percentages for unit price analysis</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <InputPercentage label="VAT" defaultValue={16} />
              <InputPercentage label="Utility" defaultValue={12} />
              <InputPercentage label="Admin" defaultValue={12} />
              <InputPercentage label="FCAS" defaultValue={72} hasInfo />
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Footer Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-40 rounded-b-2xl">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => onNavigate(Screen.BUDGET_ITEMS)}
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
          >
            Continue to Budget
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const InputPercentage = ({ label, defaultValue, hasInfo = false }: { label: string, defaultValue: number, hasInfo?: boolean }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1 mb-1.5 ml-1">
      <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
      {hasInfo && <span className="material-symbols-outlined text-[14px] text-gray-400 cursor-help" title="More info">info</span>}
    </div>
    <div className="relative flex items-center">
      <input 
        className="form-input w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-background-dark dark:border-gray-600 focus:bg-white focus:border-primary focus:ring-primary h-11 pl-3 pr-8 font-semibold text-slate-800 dark:text-slate-100 text-right transition-colors" 
        placeholder="0" 
        type="number" 
        defaultValue={defaultValue} 
      />
      <span className="absolute right-3 text-gray-400 font-medium text-sm">%</span>
    </div>
  </div>
);

export default NewProjectScreen;