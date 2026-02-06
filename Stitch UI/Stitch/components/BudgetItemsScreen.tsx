import React, { useState } from 'react';
import { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const BudgetItemsScreen: React.FC<Props> = ({ onNavigate }) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '01': true,
    '02': false,
    '03': false,
  });

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header Section */}
      <header className="flex-none bg-surface-light dark:bg-surface-dark z-20 shadow-nav pb-2">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex-1 min-w-0">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase mb-0.5">Project ID: #4029</p>
            <h1 className="text-slate-900 dark:text-white text-xl font-bold leading-tight truncate">Casa Habitación Los Robles</h1>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-2">
          <ActionButton icon="add" label="New Item" active />
          <ActionButton icon="download" label="Import" />
          <ActionButton icon="description" label="Report" onClick={() => onNavigate(Screen.BUDGET_REPORT)} />
        </div>
      </header>

      {/* Scrollable List Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark no-scrollbar pb-4">
        {/* Folder 01 */}
        <div className="mt-4">
          <FolderHeader 
            id="01" 
            title="01 PRELIMINARES" 
            total="$12,500.00" 
            expanded={expandedFolders['01']} 
            onToggle={() => toggleFolder('01')} 
          />
          {expandedFolders['01'] && (
            <div className="bg-surface-light dark:bg-surface-dark divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
              <BudgetItem 
                id="01" 
                code="01.01" 
                title="Limpieza y Trazo" 
                cost="$5,400.00" 
                details="120 m² × $45.00"
                onClick={() => onNavigate(Screen.UNIT_PRICE_EDITOR)}
              />
              <BudgetItem 
                id="02" 
                code="01.02" 
                title="Excavación Manual" 
                cost="$3,750.00" 
                details="15 m³ × $250.00"
              />
              <BudgetItem 
                id="03" 
                code="01.03" 
                title="Acarreo en carretilla" 
                cost="$3,350.00" 
                details="25 m³ × $134.00"
              />
            </div>
          )}
        </div>

        {/* Folder 02 */}
        <div className="mt-4">
          <FolderHeader 
            id="02" 
            title="02 CIMENTACIÓN" 
            total="$45,200.00" 
            expanded={expandedFolders['02']} 
            onToggle={() => toggleFolder('02')} 
          />
          {expandedFolders['02'] ? (
             <div className="p-4 text-center text-slate-500">Items would go here...</div>
          ) : (
            <div className="bg-surface-light dark:bg-surface-dark px-4 py-2 border-b border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 italic">5 items hidden...</p>
            </div>
          )}
        </div>

        {/* Folder 03 */}
        <div className="mt-4">
          <FolderHeader 
            id="03" 
            title="03 ESTRUCTURA" 
            total="$85,450.00" 
            expanded={expandedFolders['03']} 
            onToggle={() => toggleFolder('03')} 
          />
          {expandedFolders['03'] ? (
              <div className="p-4 text-center text-slate-500">Items would go here...</div>
          ) : (
            <div className="bg-surface-light dark:bg-surface-dark px-4 py-2 border-b border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 italic">12 items hidden...</p>
            </div>
          )}
        </div>
        <div className="h-6"></div>
      </main>

      {/* Sticky Footer Summary */}
      <footer className="bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 shadow-footer z-30 pb-safe-bottom rounded-b-2xl">
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-3">
            <SummaryRow label="Costo Directo" value="$135,527.54" />
            <SummaryRow label="Utilidad (10%)" value="$13,552.75" />
            <SummaryRow label="IVA (16%)" value="$27,105.51" />
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-xs text-slate-400">MXN Currency</span>
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight tabular-nums">$176,185.80</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ActionButton = ({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${active ? 'bg-primary/10 text-primary group-active:bg-primary group-active:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-active:scale-95'}`}>
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
    </div>
    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
  </button>
);

const FolderHeader = ({ id, title, total, expanded, onToggle }: { id: string, title: string, total: string, expanded: boolean, onToggle: () => void }) => (
  <div onClick={onToggle} className={`sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-y border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer transition-colors ${expanded ? 'bg-[#eef2ff] dark:bg-[#1e2330]' : 'bg-surface-light dark:bg-surface-dark'}`}>
    <div className="flex items-center gap-3 overflow-hidden">
      <span className={`material-symbols-outlined ${expanded ? 'text-primary fill-1' : 'text-slate-400 dark:text-slate-500'}`}>
        {expanded ? 'folder_open' : 'folder'}
      </span>
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h2>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-sm font-bold ${expanded ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{total}</span>
      <span className="material-symbols-outlined text-slate-400 text-lg transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
    </div>
  </div>
);

const BudgetItem = ({ id, code, title, cost, details, onClick }: { id: string, code: string, title: string, cost: string, details: string, onClick?: () => void }) => (
  <div onClick={onClick} className="group relative px-4 py-3.5 flex items-start gap-3 active:bg-blue-50 dark:active:bg-blue-900/20 transition-colors cursor-pointer odd:bg-transparent even:bg-slate-50/50 dark:even:bg-slate-800/20">
    <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
      <span className="text-[10px] font-bold">{id}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate pr-2">{code} {title}</h3>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{cost}</span>
      </div>
      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span>{details}</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button className="text-primary hover:text-blue-700"><span className="material-symbols-outlined text-base">edit</span></button>
          <button className="text-red-500 hover:text-red-700"><span className="material-symbols-outlined text-base">delete</span></button>
        </div>
      </div>
    </div>
  </div>
);

const SummaryRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
    <span>{label}</span>
    <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{value}</span>
  </div>
);

export default BudgetItemsScreen;