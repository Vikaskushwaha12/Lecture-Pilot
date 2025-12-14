import React, { useState, useRef, useEffect } from 'react';
import { LectureData, QuizQuestion, Flashcard } from '../types';
import { 
  Play, Pause, Volume2, Maximize2, FileText, 
  MessageSquare, Clock, ArrowLeft, ChevronRight,
  BrainCircuit, Zap, RefreshCw, CheckCircle, XCircle,
  Sparkles, AlignLeft, Sigma, LucideIcon, Layout
} from 'lucide-react';
import AIChat from './AIChat';
import { motion, AnimatePresence } from 'framer-motion';

interface LectureWorkspaceProps {
  lecture: LectureData;
  onBack: () => void;
}

const LectureWorkspace: React.FC<LectureWorkspaceProps> = ({ lecture, onBack }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'transcript' | 'chat' | 'quiz' | 'flashcards'>('notes');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  // Sync video play state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((curr / duration) * 100);
      
      const mins = Math.floor(curr / 60);
      const secs = Math.floor(curr % 60);
      setCurrentTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }
  };

  const jumpToTimestamp = (timestamp: string) => {
    if (videoRef.current) {
       const [mins, secs] = timestamp.split(':').map(Number);
       const timeInSecs = mins * 60 + secs;
       videoRef.current.currentTime = timeInSecs;
       setIsPlaying(true);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-[#030712] text-slate-200 font-sans">
      
      {/* LEFT PANEL - Video & Timeline */}
      <div className="flex-1 flex flex-col h-full border-r border-white/5 relative min-w-0">
        
        {/* Navbar Overlay */}
        <div className="h-16 flex items-center px-4 border-b border-white/5 bg-[#030712]">
           <button onClick={onBack} type="button" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition flex-shrink-0">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div className="ml-4 truncate">
              <h1 className="text-white font-medium truncate">{lecture.title}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Lecture View</p>
           </div>
        </div>

        {/* Video Player Container */}
        <div className="aspect-video bg-black relative group flex items-center justify-center border-b border-white/5 overflow-hidden shadow-2xl">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl opacity-50"></div>
            
            {lecture.videoUrl ? (
              <video 
                ref={videoRef}
                src={lecture.videoUrl} 
                className="w-full h-full object-contain z-10"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onClick={() => setIsPlaying(!isPlaying)}
              />
            ) : (
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b] to-black flex items-center justify-center flex-col z-10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                     <Layout className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-slate-400 text-sm font-medium">Audio Mode / Transcript Only</span>
               </div>
            )}
            
            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-end">
                <div className="p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                   {/* Progress */}
                   <div className="h-1 bg-white/20 rounded-full cursor-pointer mb-4 group/bar" onClick={(e) => {
                      if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        videoRef.current.currentTime = (x / rect.width) * videoRef.current.duration;
                      }
                   }}>
                      <div className="h-full bg-indigo-500 rounded-full relative" style={{width: `${progress}%`}}>
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/bar:scale-100 transition-transform"></div>
                      </div>
                   </div>

                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <button 
                           onClick={() => setIsPlaying(!isPlaying)}
                           className="text-white hover:text-indigo-400 transition"
                         >
                            {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
                         </button>
                         <span className="text-xs font-mono text-slate-300">{currentTime}</span>
                      </div>
                      <div className="flex gap-3">
                         <Volume2 className="w-5 h-5 text-slate-300 hover:text-white cursor-pointer" />
                         <Maximize2 className="w-5 h-5 text-slate-300 hover:text-white cursor-pointer" />
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* Timeline / Chapters Area */}
        <div className="flex-1 bg-[#030712] overflow-y-auto custom-scrollbar border-r border-white/5">
           <div className="sticky top-0 bg-[#030712]/95 backdrop-blur-sm p-4 border-b border-white/5 z-10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                 <Clock className="w-4 h-4 text-indigo-400" /> Topic Timeline
              </h3>
              <span className="text-xs text-slate-500">{lecture.segments.length} Chapters</span>
           </div>
           
           <div className="p-4 space-y-2">
             {lecture.segments.map((seg, idx) => (
                <button 
                  key={idx} 
                  type="button"
                  onClick={() => jumpToTimestamp(seg.timestamp)}
                  className={`flex gap-4 p-3 rounded-xl cursor-pointer group transition-all w-full text-left border ${
                    currentTime === seg.timestamp 
                      ? 'bg-indigo-500/10 border-indigo-500/20' 
                      : 'bg-white/[0.02] border-transparent hover:bg-white/5'
                  }`}
                >
                   <span className={`font-mono text-[10px] px-2 py-1 rounded-md h-fit transition-colors ${
                     currentTime === seg.timestamp ? 'text-indigo-300 bg-indigo-500/20' : 'text-slate-500 bg-white/5 group-hover:text-slate-300'
                   }`}>
                     {seg.timestamp}
                   </span>
                   <div className="flex-1 min-w-0">
                     <h4 className={`text-sm font-medium truncate transition-colors ${
                       currentTime === seg.timestamp ? 'text-white' : 'text-slate-300 group-hover:text-white'
                     }`}>{seg.title}</h4>
                     <p className="text-xs text-slate-500 mt-1 line-clamp-1">{seg.description}</p>
                   </div>
                   {currentTime === seg.timestamp && (
                      <div className="flex space-x-0.5 self-center">
                        <div className="w-1 h-3 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]"></div>
                        <div className="w-1 h-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
                        <div className="w-1 h-4 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
                      </div>
                   )}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Tools & Content */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-[#02040a] flex flex-col border-l border-white/5 relative shadow-2xl z-20">
        
        {/* Floating Tabs */}
        <div className="p-4 border-b border-white/5">
           <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto no-scrollbar">
              <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={FileText} label="Notes" />
              <TabButton active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')} icon={AlignLeft} label="Script" />
              <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={MessageSquare} label="AI Tutor" />
              <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={Zap} label="Quiz" />
              <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} icon={BrainCircuit} label="Cards" />
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="h-full"
             >
               {activeTab === 'notes' && <NotesView lecture={lecture} />}
               {activeTab === 'transcript' && <TranscriptView text={lecture.transcript} />}
               {activeTab === 'chat' && <AIChat lecture={lecture} />}
               {activeTab === 'quiz' && <QuizView quizzes={lecture.quizzes || []} />}
               {activeTab === 'flashcards' && <FlashcardsView flashcards={lecture.flashcards || []} />}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 min-w-[70px] py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
      active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute inset-0 bg-indigo-600 rounded-lg shadow-lg"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  </button>
);

const NotesView = ({ lecture }: { lecture: LectureData }) => (
  <div className="h-full overflow-y-auto p-6 custom-scrollbar pb-20">
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 shadow-lg mb-8">
      <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
        <Sparkles className="w-3 h-3" /> TL;DR Summary
      </h3>
      <p className="text-indigo-100/90 text-sm leading-7 font-light">{lecture.summary}</p>
    </div>

    {/* FORMULAS */}
    {lecture.formulas && lecture.formulas.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
            <Sigma className="w-3 h-3" /> Key Formulas
          </h3>
          <div className="grid gap-3">
            {lecture.formulas.map((formula, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                  <div className="font-mono text-center text-lg text-white mb-3 py-2 bg-black/30 rounded-lg">
                      {formula.latex}
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm text-slate-300 font-medium">{formula.description}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
    )}

    {/* SECTIONS */}
    <div className="space-y-8">
      {lecture.notes.map((section, idx) => (
        <div key={idx} className="relative pl-4 border-l border-white/10">
          <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#02040a]"></div>
          <h3 className="text-white font-bold text-lg mb-4">{section.heading}</h3>
          <ul className="space-y-3">
            {section.points.map((point, pIdx) => (
              <li key={pIdx} className="text-slate-400 text-sm leading-7 group hover:text-slate-200 transition-colors">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600 mr-3 mb-0.5 group-hover:bg-indigo-400 transition-colors"></span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const TranscriptView = ({ text }: { text: string }) => (
  <div className="h-full overflow-y-auto p-6 custom-scrollbar">
    <div className="prose prose-invert prose-sm max-w-none">
      <h3 className="text-white font-bold mb-6">Verbatim Transcript</h3>
      <div className="text-slate-400 font-mono text-xs leading-loose tracking-wide whitespace-pre-wrap">
        {text || "No transcript available."}
      </div>
    </div>
  </div>
);

const QuizView = ({ quizzes }: { quizzes: QuizQuestion[] }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!quizzes.length) return <div className="p-8 text-center text-slate-500">No quizzes available.</div>;

  const handleSelect = (qId: number, optionIdx: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({...prev, [qId]: optionIdx}));
  };

  const score = quizzes.reduce((acc, q) => acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0), 0);

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar pb-20">
      <div className="flex justify-between items-end mb-8 bg-gradient-to-r from-indigo-900/40 to-transparent p-6 rounded-2xl border border-white/5">
         <div>
           <h2 className="text-white text-xl font-bold">Knowledge Check</h2>
           <p className="text-indigo-200 text-xs mt-1">Review your understanding</p>
         </div>
         {showResults && (
           <div className="text-right">
             <span className="text-4xl font-bold text-indigo-400">{Math.round((score/quizzes.length)*100)}%</span>
             <p className="text-xs text-slate-500">Accuracy</p>
           </div>
         )}
      </div>
      
      <div className="space-y-8">
        {quizzes.map((q, idx) => (
            <div key={q.id} className="relative">
              <span className="text-5xl font-bold text-white/5 absolute -top-4 -left-4 pointer-events-none select-none">{idx + 1}</span>
              <h3 className="text-slate-200 font-medium mb-4 relative z-10 pl-2">{q.question}</h3>
              <div className="space-y-2 pl-2">
                {q.options.map((opt, optIdx) => {
                  let style = "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10";
                  if (showResults) {
                     if (optIdx === q.correctAnswer) style = "border-green-500/50 bg-green-500/10 text-green-200";
                     else if (selectedAnswers[q.id] === optIdx) style = "border-red-500/50 bg-red-500/10 text-red-200";
                     else style = "border-white/5 opacity-40";
                  } else {
                     if (selectedAnswers[q.id] === optIdx) style = "border-indigo-500 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10";
                  }
                  return (
                    <button key={optIdx} onClick={() => handleSelect(q.id, optIdx)} className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${style}`}>
                      {opt}
                      {showResults && optIdx === q.correctAnswer && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {showResults && selectedAnswers[q.id] === optIdx && optIdx !== q.correctAnswer && <XCircle className="w-4 h-4 text-red-500" />}
                    </button>
                  );
                })}
              </div>
              {showResults && <div className="mt-4 ml-2 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 leading-relaxed"><span className="font-bold block mb-1">Explanation:</span>{q.explanation}</div>}
            </div>
        ))}
      </div>

      <div className="mt-8">
        {!showResults ? (
           <button onClick={() => setShowResults(true)} disabled={Object.keys(selectedAnswers).length < quizzes.length} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg">Submit Answers</button>
        ) : (
           <button onClick={() => { setShowResults(false); setSelectedAnswers({}); }} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Reset Quiz</button>
        )}
      </div>
    </div>
  );
};

const FlashcardsView = ({ flashcards }: { flashcards: Flashcard[] }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards.length) return <div className="p-8 text-center text-slate-500">No flashcards available.</div>;

  const nextCard = () => { setIsFlipped(false); setTimeout(() => setCurrentIdx((p) => (p + 1) % flashcards.length), 200); };
  const prevCard = () => { setIsFlipped(false); setTimeout(() => setCurrentIdx((p) => (p - 1 + flashcards.length) % flashcards.length), 200); };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-[#02040a]">
      <div className="text-center mb-8">
        <h2 className="text-white font-bold text-xl">Study Cards</h2>
        <div className="flex gap-1 justify-center mt-2">
           {flashcards.map((_, i) => (
             <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIdx ? 'bg-indigo-500' : 'bg-white/10'}`}></div>
           ))}
        </div>
      </div>

      <div className="w-full max-w-sm aspect-[4/3] relative perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
         <motion.div 
           className="w-full h-full relative preserve-3d"
           initial={false}
           animate={{ rotateY: isFlipped ? 180 : 0 }}
           transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
           style={{ transformStyle: 'preserve-3d' }}
         >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6 border border-indigo-500/20 px-2 py-1 rounded">Term</span>
               <h3 className="text-2xl font-bold text-white leading-tight">{flashcards[currentIdx].front}</h3>
               <p className="text-slate-600 text-xs absolute bottom-6 font-medium">Click to reveal</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl" style={{ transform: 'rotateY(180deg)' }}>
               <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-6 border border-white/20 px-2 py-1 rounded">Definition</span>
               <p className="text-lg leading-relaxed font-medium">{flashcards[currentIdx].back}</p>
            </div>
         </motion.div>
      </div>

      <div className="flex gap-6 mt-12">
        <button onClick={prevCard} className="p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:scale-110 transition-all"><ChevronRight className="w-5 h-5 rotate-180" /></button>
        <button onClick={nextCard} className="p-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-110 shadow-lg shadow-indigo-500/20 transition-all"><ChevronRight className="w-5 h-5" /></button>
      </div>
      
      <style>{`.perspective-1000 { perspective: 1000px; } .backface-hidden { backface-visibility: hidden; }`}</style>
    </div>
  );
};

export default LectureWorkspace;