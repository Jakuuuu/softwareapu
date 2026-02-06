import React from 'react';
import { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const ResourceDatabaseScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center p-4 pb-2 justify-between">
          <h2 className="text-[#0e121b] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1">Resource Database</h2>
          <button className="flex items-center justify-end text-primary hover:text-primary/80 transition-colors">
            <span className="material-symbols-outlined text-xl mr-1">add</span>
            <p className="text-base font-bold leading-normal tracking-[0.015em] shrink-0">Add New</p>
          </button>
        </div>
        {/* Search Bar */}
        <div className="px-4 py-3">
          <label className="flex flex-col w-full">
            <div className="relative flex w-full flex-1 items-stretch rounded-lg h-12 bg-white dark:bg-[#1e2736] shadow-sm border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <div className="flex items-center justify-center pl-4 pr-2 text-gray-400 dark:text-gray-500">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-transparent text-[#0e121b] dark:text-white focus:outline-0 focus:ring-0 border-none h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-0 text-base font-normal leading-normal" 
                placeholder="Search code, name..." 
                defaultValue=""
              />
              <div className="flex items-center justify-center px-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-primary transition-colors">
                <span className="material-symbols-outlined">tune</span>
              </div>
            </div>
          </label>
        </div>
        {/* Tabs */}
        <div>
          <div className="flex border-b border-[#d0d7e7] dark:border-gray-700 px-4 justify-between space-x-4">
            <TabItem label="Materials" active />
            <TabItem label="Labor" />
            <TabItem label="Equipment" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full pb-24">
        {/* Bulk Action */}
        <div className="flex px-4 py-4 justify-center bg-background-light dark:bg-background-dark sticky top-[0] z-10">
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-primary hover:bg-blue-700 text-[#f8f9fc] text-sm font-bold leading-normal tracking-[0.015em] shadow-sm transition-colors transform active:scale-[0.98]">
            <span className="material-symbols-outlined mr-2 text-[20px]">price_check</span>
            <span className="truncate">Bulk Update Prices</span>
          </button>
        </div>
        
        {/* List Header */}
        <div className="flex px-4 pb-2 pt-0 justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span>Description</span>
          <span className="mr-14">Price</span>
        </div>

        {/* List Items */}
        <div className="flex flex-col gap-3 px-4">
          <ResourceCard code="M-203" unit="bag" name="Portland Cement Type I (42.5kg)" price={8.50} />
          <ResourceCard code="M-105" unit="m³" name="Construction Sand (Washed)" price={45.00} />
          <ResourceCard code="M-402" unit="ton" name='Steel Rebar #4 (1/2") Grade 60' price={920.00} />
          <ResourceCard code="M-122" unit="m³" name="Ready-Mix Concrete 3000 PSI" price={115.50} />
          <ResourceCard code="M-308" unit="pc" name='Concrete Block 6" (Standard)' price={1.25} />
          
          <div className="flex justify-center py-6 text-gray-400 dark:text-gray-600">
            <span className="text-xs font-medium uppercase tracking-widest">End of results</span>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-[#1e2736] border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 z-30 rounded-b-2xl">
        <div className="flex justify-around items-end h-14 pb-2">
            <NavIcon icon="home" label="Home" onClick={() => onNavigate(Screen.NEW_PROJECT)} />
            <NavIcon icon="folder_open" label="Projects" onClick={() => onNavigate(Screen.BUDGET_ITEMS)} />
            <NavIcon icon="dataset" label="Database" active onClick={() => onNavigate(Screen.RESOURCE_DATABASE)} />
            <NavIcon icon="settings" label="Settings" />
        </div>
      </nav>
    </div>
  );
};

const TabItem = ({ label, active }: { label: string, active?: boolean }) => (
  <a className="relative flex flex-col items-center justify-center pb-3 pt-2 flex-1 group cursor-pointer" href="#">
    <p className={`text-sm font-bold leading-normal tracking-[0.015em] transition-colors ${active ? 'text-primary dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 font-semibold'}`}>{label}</p>
    <div className={`absolute bottom-0 w-full h-[3px] rounded-t-full transition-colors ${active ? 'bg-primary' : 'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-600'}`}></div>
  </a>
);

const ResourceCard = ({ code, unit, name, price }: { code: string, unit: string, name: string, price: number }) => (
  <div className="bg-white dark:bg-[#1e2736] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group active:border-primary/50 transition-colors">
    <div className="flex flex-col flex-1 min-w-0 pr-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">{code}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">Unit: {unit}</span>
      </div>
      <p className="text-[#0e121b] dark:text-gray-100 text-base font-semibold leading-snug line-clamp-2">{name}</p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <p className="text-primary dark:text-blue-400 text-lg font-bold tabular-nums tracking-tight">${price.toFixed(2)}</p>
      <div className="flex flex-col gap-2 ml-1 border-l border-gray-100 dark:border-gray-700 pl-3">
        <button aria-label="Edit" className="text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-blue-400 transition-colors">
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
        <button aria-label="Delete" className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors">
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  </div>
);

const NavIcon = ({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-primary dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
    <span className={`material-symbols-outlined text-[24px] ${active ? 'fill-current' : ''}`}>{icon}</span>
    <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

export default ResourceDatabaseScreen;