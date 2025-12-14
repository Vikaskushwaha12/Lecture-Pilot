import React from 'react';
import { Home, LayoutDashboard, UploadCloud, Settings, BookOpen, MessageSquare } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const NavItem = ({ icon: Icon, label, view, active }: { icon: any, label: string, view?: View, active?: boolean }) => (
    <button 
      type="button"
      onClick={() => view ? onChangeView(view) : alert("This feature is coming soon!")}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-all duration-200 ${
        active 
          ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
          : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      {/* Tooltip */}
      <span className="absolute left-14 bg-surface border border-white/10 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {label}
      </span>
    </button>
  );

  return (
    <aside className="w-20 bg-surface border-r border-white/5 flex flex-col items-center py-6 h-screen sticky top-0">
      <div className="mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
           <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center w-full">
        <NavItem icon={Home} label="Home" view="home" active={currentView === 'home'} />
        <NavItem icon={LayoutDashboard} label="Workspace" view="workspace" active={currentView === 'workspace'} />
        <NavItem icon={UploadCloud} label="Uploads" />
        <NavItem icon={BookOpen} label="My Notes" />
        <div className="mt-auto">
          <NavItem icon={Settings} label="Settings" view="settings" active={currentView === 'settings'} />
        </div>
      </nav>
    </aside>
  );
};