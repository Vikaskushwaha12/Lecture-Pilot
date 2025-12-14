import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="h-16 border-b border-white/5 bg-[#050B1A]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-12 w-full max-w-7xl mx-auto">
        {/* Logo Area - Hidden on mobile if sidebar handles it, but good for context */}
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 hidden md:block">
          Lecture Pilot
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search lectures, notes, or concepts..." 
            className="w-full bg-surface border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-auto">
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
          </button>
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-white/5 hover:bg-white/5 transition-all">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-300 pr-2 hidden sm:block">Student Account</span>
          </button>
        </div>
      </div>
    </nav>
  );
};