import React, { useState } from 'react';
import { Screen, NavItem } from './types';
import NewProjectScreen from './components/NewProjectScreen';
import BudgetItemsScreen from './components/BudgetItemsScreen';
import UnitAnalysisScreen from './components/UnitAnalysisScreen';
import ResourceDatabaseScreen from './components/ResourceDatabaseScreen';
import BudgetReportScreen from './components/BudgetReportScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.NEW_PROJECT);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const navItems: NavItem[] = [
    { id: Screen.NEW_PROJECT, label: 'Project Setup', icon: 'post_add' },
    { id: Screen.BUDGET_ITEMS, label: 'Budget', icon: 'folder_open' },
    { id: Screen.UNIT_PRICE_EDITOR, label: 'Analysis', icon: 'calculate' },
    { id: Screen.RESOURCE_DATABASE, label: 'Database', icon: 'dataset' },
    { id: Screen.BUDGET_REPORT, label: 'Report', icon: 'description' },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center p-0 sm:p-4">
      
      {/* Desktop/Tablet Container Mockup */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden sm:rounded-[2rem] sm:h-[850px] sm:border-[8px] sm:border-gray-800 dark:sm:border-gray-700">
        
        {/* Screen Content */}
        <div className="flex-1 h-full overflow-hidden relative">
          {currentScreen === Screen.NEW_PROJECT && <NewProjectScreen onNavigate={navigateTo} />}
          {currentScreen === Screen.BUDGET_ITEMS && <BudgetItemsScreen onNavigate={navigateTo} />}
          {currentScreen === Screen.UNIT_PRICE_EDITOR && <UnitAnalysisScreen onNavigate={navigateTo} />}
          {currentScreen === Screen.RESOURCE_DATABASE && <ResourceDatabaseScreen onNavigate={navigateTo} />}
          {currentScreen === Screen.BUDGET_REPORT && <BudgetReportScreen onNavigate={navigateTo} />}
        </div>

      </div>

      {/* External Navigation for Demo Purposes (Desktop only) */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Screen Navigation</h3>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentScreen === item.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;