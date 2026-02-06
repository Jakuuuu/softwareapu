import React, { useState } from 'react';
import { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const UnitAnalysisScreen: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'Materials' | 'Labor' | 'Equip'>('Materials');

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white dark:bg-surface-dark z-20 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 pb-2">
          <button onClick={() => onNavigate(Screen.BUDGET_ITEMS)} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Analysis: COL-C25</h2>
          </div>
          <button className="flex items-center justify-center h-10 px-2 text-primary font-semibold text-sm hover:opacity-80">
            Edit
          </button>
        </div>
        <div className="px-5 pb-4 pt-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Column 25×25</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">Code: COL-001</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">•</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Unit: <strong>ML</strong></span>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-32 hide-scroll">
        <div className="p-5 bg-white dark:bg-surface-dark mb-2 border-b border-slate-100 dark:border-slate-800">
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Daily Performance</label>
          <div className="relative flex items-center">
            <input 
              className="block w-full rounded-lg border-0 py-3 pl-4 pr-20 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary font-mono text-lg bg-white dark:bg-slate-800" 
              type="text" 
              defaultValue="8.50" 
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">ML/day</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Calculated: <strong>0.94</strong> hours per unit</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-slate-50 dark:bg-background-dark/95 backdrop-blur-sm px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex p-1 space-x-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
            {(['Materials', 'Labor', 'Equip'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-colors ${
                  activeTab === tab 
                    ? 'text-primary bg-white dark:bg-slate-700 shadow ring-1 ring-black/5 dark:ring-white/5' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resources</span>
            <span className="text-xs font-mono font-medium text-slate-500">Subtotal: $56.35</span>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-surface-dark min-h-[300px]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-2 px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-[72px]">
            <div className="truncate">Item</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Waste</div>
            <div className="text-right">Total</div>
          </div>
          
          <ResourceRow title="Portland Cement" unit="kg" unitPrice={0.15} qty={25.00} waste={5} total={3.94} />
          <ResourceRow title='Rebar 3/8" Grade 60' unit="kg" unitPrice={1.20} qty={12.00} waste={3} total={14.83} />
          <ResourceRow title="Washed Sand" unit="m3" unitPrice={22.50} qty={0.08} waste={8} total={1.94} />
          <ResourceRow title='Gravel 3/4"' unit="m3" unitPrice={28.00} qty={0.11} waste={8} total={3.32} />
          <ResourceRow title="Formwork Oil" unit="gal" unitPrice={12.00} qty={0.05} waste={0} total={0.60} />
          <ResourceRow title="Tie Wire #16" unit="kg" unitPrice={1.80} qty={0.50} waste={5} total={0.95} />

          <div className="p-4 flex justify-center pb-8">
            <button className="inline-flex items-center gap-x-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Material
            </button>
          </div>
        </div>
      </main>

      {/* Floating Bottom Panel */}
      <div className="absolute bottom-0 inset-x-0 z-30">
        <div className="h-12 w-full bg-gradient-to-t from-black/10 to-transparent pointer-events-none dark:from-black/50"></div>
        <div className="bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 px-5 pt-4 pb-8 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Unit Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">$91.55</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ ML</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 mb-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary"></span>
                  Mat: $56.35
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  Lab: $30.20
                </div>
              </div>
            </div>
            <button className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">save</span>
              Save Calculation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceRow = ({ title, unit, unitPrice, qty, waste, total }: { title: string, unit: string, unitPrice: number, qty: number, waste: number, total: number }) => (
  <div className="group relative grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-800 items-start hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
    <div className="flex flex-col min-w-0 pr-1">
      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{title}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">Unit: {unit} • ${unitPrice.toFixed(2)}</span>
    </div>
    <div className="text-right font-mono text-sm text-slate-700 dark:text-slate-300 pt-0.5 bg-slate-50 dark:bg-slate-800 rounded px-1 self-start border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700">
      {qty.toFixed(2)}
    </div>
    <div className="text-right font-mono text-sm text-slate-500 dark:text-slate-400 pt-0.5">{waste}%</div>
    <div className="text-right font-mono text-sm font-medium text-slate-900 dark:text-white pt-0.5">${total.toFixed(2)}</div>
  </div>
);

export default UnitAnalysisScreen;