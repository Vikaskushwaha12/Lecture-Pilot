import React from 'react';
import { Play, FileText, BrainCircuit, ChevronRight, Check, ArrowRight, Zap, Layers } from 'lucide-react';
import LectureUploader, { DEMO_TRANSCRIPT } from './LectureUploader';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onUpload: (text: string, fileUrl?: string) => void;
  isLoading: boolean;
  progressMessage?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onUpload, isLoading, progressMessage }) => {
  return (
    <div className="w-full flex flex-col items-center relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-2000" />

      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center relative z-10">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10"
        >
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           v2.0 powered by Gemini 2.5 Flash
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-8"
        >
          Supercharge Your <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient">
            Lecture Revision
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          Convert hours of video into clear notes, active recall quizzes, and flashcards in seconds. Stop scrubbing, start understanding.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-20"
        >
          <button 
             onClick={() => document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:-translate-y-1 flex items-center gap-2 group"
          >
            Start Learning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onUpload(DEMO_TRANSCRIPT)}
            disabled={isLoading}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold transition-all backdrop-blur-md hover:-translate-y-1 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> View Demo
          </button>
        </motion.div>

        {/* Upload Modal Area */}
        <motion.div 
          id="upload-area" 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full flex justify-center perspective-1000"
        >
           <LectureUploader onUpload={onUpload} isLoading={isLoading} progressMessage={progressMessage} />
        </motion.div>

      </div>

      {/* Feature Grid */}
      <div className="w-full bg-[#02050f] py-32 border-t border-white/5 relative">
         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to ace the exam</h2>
              <p className="text-slate-400">Our AI pipeline handles the heavy lifting so you can focus on retention.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                  icon={<Layers className="w-6 h-6 text-cyan-400" />}
                  title="Smart Segmentation"
                  desc="Videos are automatically broken down into logical chapters with titles, making navigation effortless."
                  delay={0}
                />
                <FeatureCard 
                  icon={<FileText className="w-6 h-6 text-indigo-400" />}
                  title="Structured Notes"
                  desc="Get concise, hierarchical bullet points that capture the essence of the lecture without the fluff."
                  delay={0.1}
                />
                <FeatureCard 
                  icon={<Zap className="w-6 h-6 text-purple-400" />}
                  title="Instant Quizzes"
                  desc="Test your knowledge immediately with AI-generated multiple choice questions and explanations."
                  delay={0.2}
                />
            </div>
         </div>
      </div>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-8 rounded-3xl hover:bg-white/5 transition-colors group cursor-default"
  >
    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-white/10 transition-all duration-300 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);