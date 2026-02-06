import React from 'react';
import { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const BudgetReportScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-4 py-3 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate(Screen.BUDGET_ITEMS)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Final Budget Report</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-primary">
            <span className="material-symbols-outlined">ios_share</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-32 space-y-5 no-scrollbar">
        {/* 1. Document Header: Project Info */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card p-4 border border-slate-100 dark:border-slate-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1 block">Project</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Casa Habitación Los Robles</h2>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">apartment</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <InfoField label="Location" value="Monterrey, NL" />
            <InfoField label="Owner" value="Juan Pérez" />
            <InfoField label="Date" value="Oct 24, 2023" />
            <InfoField label="Ref ID" value="#BUD-23-098" monospace />
          </div>
        </section>

        {/* 2. Global Factors */}
        <section className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          <FactorBadge color="bg-indigo-500" label="IVA" value="16%" />
          <FactorBadge color="bg-emerald-500" label="Utility" value="12%" />
          <FactorBadge color="bg-amber-500" label="Admin" value="15%" />
        </section>

        {/* 3. Smart Alerts */}
        <section className="bg-warning-bg border border-warning-border rounded-xl p-4 flex gap-3 shadow-sm">
          <div className="text-warning-text shrink-0 mt-0.5">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-warning-text mb-1">Zone Check: Sierra Coefficient</h3>
            <p className="text-xs text-warning-text/90 leading-relaxed">+3% Labor cost adjustment automatically applied based on regional difficulty settings for 'Sierra' zone.</p>
          </div>
        </section>

        {/* 4. Cost Breakdown */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white">Cost Breakdown</h3>
            <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">5 Chapters</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <BreakdownItem id="01" title="PRELIMINARES" count="3 Items" total="$12,500.00" />
            
            {/* Expanded Item Example */}
            <div className="group">
              <div className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center text-xs font-bold">02</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">MOVIMIENTO DE TIERRAS</p>
                    <p className="text-xs text-secondary">2 Items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">$45,200.00</p>
                  <span className="material-symbols-outlined text-primary text-[18px]">expand_less</span>
                </div>
              </div>
              <div className="bg-slate-50/30 dark:bg-slate-800/20 pl-4">
                <SubItem code="02-01" name="Excavación manual" details="100.00 m3 x $250.00" total="$25,000.00" />
                <SubItem code="02-02" name="Relleno compactado" details="202.00 m3 x $100.00" total="$20,200.00" />
              </div>
            </div>

            <BreakdownItem id="03" title="CIMENTACIÓN" count="5 Items" total="$67,318.32" />
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-center">
            <button className="text-primary text-sm font-medium flex items-center justify-center gap-1">
              View Full Analysis <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* 5. Economic Summary Card */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Economic Summary</h3>
              <p className="text-xs text-secondary mt-1">Resource distribution by cost type</p>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined text-secondary">pie_chart</span>
            </div>
          </div>
          {/* Visualization Bars */}
          <div className="flex w-full h-4 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary" style={{ width: '41.3%' }}></div>
            <div className="h-full bg-slate-400" style={{ width: '35.8%' }}></div>
            <div className="h-full bg-sky-300" style={{ width: '22.9%' }}></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatColumn colorClass="bg-primary" label="Labor" value="41.3%" />
            <StatColumn colorClass="bg-slate-400" label="Material" value="35.8%" bordered />
            <StatColumn colorClass="bg-sky-300" label="Equip" value="22.9%" bordered />
          </div>
        </section>

        {/* 6. Totals Section */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-card p-5 border border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Final Totals</h3>
          <div className="space-y-3">
            <TotalRow label="Costo Directo" value="$125,000.00" />
            <TotalRow label="Admin (15%)" value="$18,750.00" />
            <TotalRow label="Utility (12%)" value="$15,000.00" />
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subtotal</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">$158,750.00</span>
            </div>
            <TotalRow label="IVA (16%)" value="$25,400.00" />
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
            <div className="flex justify-between items-end pt-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">Grand Total</span>
              <span className="text-2xl font-black font-mono text-primary">$184,150.00</span>
            </div>
            <p className="text-right text-[10px] text-secondary mt-1">Currency: MXN</p>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 p-4 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-b-2xl">
        <div className="flex gap-3 max-w-2xl mx-auto">
            <ActionBtn icon="content_copy" label="Copy" secondary />
            <ActionBtn icon="table_chart" label="Excel" secondary />
            <ActionBtn icon="picture_as_pdf" label="Export PDF" primary />
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, monospace }: { label: string, value: string, monospace?: boolean }) => (
  <div>
    <span className="text-xs text-secondary block">{label}</span>
    <span className={`text-sm font-medium text-slate-700 dark:text-slate-200 ${monospace ? 'font-mono text-xs' : ''}`}>{value}</span>
  </div>
);

const FactorBadge = ({ color, label, value }: { color: string, label: string, value: string }) => (
  <div className="flex-none bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${color}`}></span>
    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}: <span className="text-slate-900 dark:text-white">{value}</span></span>
  </div>
);

const BreakdownItem = ({ id, title, count, total }: { id: string, title: string, count: string, total: string }) => (
  <div className="group">
    <div className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center text-xs font-bold">{id}</div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-secondary">{count}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">{total}</p>
        <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
      </div>
    </div>
  </div>
);

const SubItem = ({ code, name, details, total }: { code: string, name: string, details: string, total: string }) => (
  <div className="py-3 pr-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-start ml-11">
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-600 dark:text-slate-300">{code}</span>
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{name}</p>
      </div>
      <p className="text-[11px] text-secondary">{details}</p>
    </div>
    <p className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">{total}</p>
  </div>
);

const StatColumn = ({ colorClass, label, value, bordered }: { colorClass: string, label: string, value: string, bordered?: boolean }) => (
  <div className={`flex flex-col gap-1 ${bordered ? 'border-l border-slate-100 dark:border-slate-800 pl-3' : ''}`}>
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
      <span className="text-[11px] font-semibold text-secondary uppercase tracking-wide">{label}</span>
    </div>
    <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{value}</span>
  </div>
);

const TotalRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-secondary">{label}</span>
    <span className="text-sm font-medium font-mono text-slate-900 dark:text-white">{value}</span>
  </div>
);

const ActionBtn = ({ icon, label, primary, secondary }: { icon: string, label: string, primary?: boolean, secondary?: boolean }) => (
  <button className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 px-4 rounded-xl active:scale-95 transition-transform ${primary ? 'bg-primary text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 flex-[2]' : ''} ${secondary ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700' : ''}`}>
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

export default BudgetReportScreen;