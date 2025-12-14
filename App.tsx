import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import LectureWorkspace from './components/LectureWorkspace';
import { LectureData, AppState, View } from './types';
import { analyzeLecture } from './services/geminiService';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentView, setCurrentView] = useState<View>('home');
  const [lectureData, setLectureData] = useState<LectureData | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>('');
  
  // Handlers
  const handleUpload = async (content: File | string, fileUrl?: string) => {
    setAppState(AppState.PROCESSING);
    setProgressMsg("Initializing analysis...");
    
    try {
      const data = await analyzeLecture(content, (msg) => {
        console.log(msg); 
        setProgressMsg(msg);
      });
      
      if (fileUrl) {
          data.videoUrl = fileUrl;
      }
      
      setLectureData(data);
      setAppState(AppState.DASHBOARD);
      setCurrentView('workspace');
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      alert("Failed to process lecture. Please try again or use a smaller file.");
    }
  };

  const handleNavigate = (view: View) => {
    if (view === 'workspace' && !lectureData) return;
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      
      {/* Top Navigation */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar currentView={currentView} onChangeView={handleNavigate} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#030712] to-[#030712]">
          
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
               <motion.div 
                 key="home"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.3 }}
                 className="h-full overflow-y-auto custom-scrollbar"
               >
                 {appState === AppState.PROCESSING && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                   >
                     <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                        <div className="w-20 h-20 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mb-8 relative z-10"></div>
                     </div>
                     <h2 className="text-2xl font-bold text-white tracking-tight">Processing Lecture</h2>
                     <p className="text-slate-400 mt-2 font-mono text-sm animate-pulse flex items-center gap-2">
                       <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                       {progressMsg}
                     </p>
                   </motion.div>
                 )}
                 <LandingPage 
                   onUpload={handleUpload} 
                   isLoading={appState === AppState.PROCESSING} 
                   progressMessage={progressMsg}
                 />
               </motion.div>
            )}

            {currentView === 'workspace' && lectureData && (
               <motion.div 
                 key="workspace"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 transition={{ duration: 0.4 }}
                 className="h-full"
               >
                 <LectureWorkspace 
                    lecture={lectureData} 
                    onBack={() => setCurrentView('home')} 
                 />
               </motion.div>
            )}

            {currentView === 'settings' && (
               <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-12 max-w-4xl mx-auto h-full overflow-y-auto"
               >
                 <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Settings</h1>
                 <div className="glass-panel rounded-2xl p-8">
                    <p className="text-slate-400">Account settings and preferences coming soon.</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
};

export default App;