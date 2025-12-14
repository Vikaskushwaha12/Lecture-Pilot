import React, { useState, useRef } from 'react';
import { Upload, FileText, PlayCircle, X, Globe, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface LectureUploaderProps {
  onUpload: (content: File | string, fileUrl?: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
  progressMessage?: string;
}

export const DEMO_TRANSCRIPT = `
Welcome to this lecture on Introduction to Machine Learning. Today we're going to cover the basic concepts of supervised and unsupervised learning.
00:10 - Let's start with Supervised Learning. In supervised learning, we have a dataset consisting of both input features and target variables. The goal is to learn a mapping function from input to output. Common algorithms include Linear Regression and Decision Trees.
05:30 - Now moving on to Unsupervised Learning. Here, we only have input data, no labels. The goal is to find hidden structures in the data. Clustering is a prime example, like K-Means clustering.
10:15 - A key concept in ML is the Bias-Variance tradeoff. High bias means underfitting, high variance means overfitting. You want to find the sweet spot.
15:00 - Finally, let's discuss Neural Networks briefly. They are inspired by the biological brain and consist of layers of neurons. Deep Learning is essentially just deep neural networks.
`;

const LectureUploader: React.FC<LectureUploaderProps> = ({ onUpload, isLoading, onCancel, progressMessage }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      setError("File too large. Max size is 500MB.");
      return false;
    }
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload MP4, MOV, MKV, MP3, or WAV.");
      return false;
    }
    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;
    setError(null);
    const blobUrl = URL.createObjectURL(file);
    onUpload(file, blobUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl glass-panel rounded-3xl shadow-2xl p-8 relative overflow-hidden transition-all duration-300 group hover:shadow-[0_0_50px_rgba(99,102,241,0.15)]">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/15 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      {onCancel && (
        <button onClick={onCancel} type="button" className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-20">
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Process New Lecture</h2>
        <p className="text-slate-400 text-sm">Upload your material to generate an AI study guide.</p>
        
        <div className="inline-flex bg-white/5 p-1 rounded-xl mt-6 border border-white/5">
           <button 
             type="button"
             onClick={() => setActiveTab('upload')}
             className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
           >
             File Upload
           </button>
           <button 
             type="button"
             onClick={() => setActiveTab('text')}
             className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'text' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
           >
             Paste Transcript
           </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-200 text-sm animate-pulse">
           <AlertCircle className="w-4 h-4 flex-shrink-0" />
           {error}
        </div>
      )}

      {activeTab === 'upload' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onClick={() => !isLoading && fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="video/*,audio/*"
              onChange={handleChange}
              disabled={isLoading}
            />
            
            {isLoading ? (
               <div className="flex flex-col items-center py-6 w-full relative z-10">
                 <div className="relative mb-6">
                   <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 rounded-full animate-pulse"></div>
                   <Loader2 className="w-10 h-10 text-indigo-400 animate-spin relative" />
                 </div>
                 <h3 className="text-white font-medium mb-1">Analyzing content</h3>
                 <p className="text-xs text-slate-400 mb-6 font-mono">{progressMessage || "Generating insights..."}</p>
                 
                 {/* Styled Progress Bar */}
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-cyan-400 animate-[width_2s_ease-in-out_infinite] w-2/3 rounded-full blur-[2px]"></div>
                    <div className="absolute inset-y-0 left-0 bg-indigo-500 animate-[width_2s_ease-in-out_infinite] w-2/3 rounded-full"></div>
                 </div>
               </div>
            ) : (
              <>
                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Upload className={`w-7 h-7 ${dragActive ? 'text-white' : 'text-indigo-400'}`} />
                </div>
                <h3 className="text-white font-medium mb-1">Click to Upload</h3>
                <p className="text-xs text-slate-500 mb-6">Drag & drop MP4, MP3, MKV</p>
                <div className="flex gap-2">
                  <span className="text-[10px] border border-white/10 bg-white/5 px-2 py-1 rounded-md text-slate-400">MP4</span>
                  <span className="text-[10px] border border-white/10 bg-white/5 px-2 py-1 rounded-md text-slate-400">MP3</span>
                </div>
              </>
            )}
          </div>

          {/* Demo Button */}
          <button 
            type="button"
            onClick={() => onUpload(DEMO_TRANSCRIPT)}
            disabled={isLoading}
            className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-cyan-500/50 hover:bg-white/5 transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-white font-medium mb-1">Try Demo Text</h3>
            <p className="text-xs text-slate-500">Intro to Machine Learning</p>
          </button>
        </div>
      ) : (
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2">
          <div className="relative">
            <textarea
              className="w-full h-40 bg-[#050B1A] border border-white/10 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 resize-none font-mono text-sm leading-relaxed"
              placeholder="Paste lecture transcript here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isLoading}
            ></textarea>
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
               {textInput.length} chars
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
             <div className="flex items-center gap-2 text-xs text-slate-500">
                <Globe className="w-3 h-3" />
                <span>Supports Multi-language</span>
             </div>
             <button
              type="button"
              onClick={() => textInput.trim() && onUpload(textInput)}
              disabled={isLoading || !textInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Analyze Text
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureUploader;