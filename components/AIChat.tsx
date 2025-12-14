import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, LectureData } from '../types';
import { apiChatWithLecture } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface AIChatProps {
  lecture: LectureData;
}

const AIChat: React.FC<AIChatProps> = ({ lecture }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your AI tutor for **"${lecture.title || 'this lecture'}"**. I can answer questions or quiz you. What's on your mind?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText, timestamp: new Date() };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await apiChatWithLecture(lecture.id, history, userText);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#02040a] relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-4" ref={scrollRef}>
        <div className="h-4"></div>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'model' ? (
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg mb-1">
                 <Bot size={16} />
               </div>
            ) : (
               <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mb-1">
                 <User size={16} />
               </div>
            )}
            
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-md ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-[#1e293b] text-slate-200 border border-white/5 rounded-bl-none'
            }`}>
              <ReactMarkdown 
                className="markdown-content"
                components={{
                  strong: ({node, ...props}) => <span className="font-semibold text-white" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1 opacity-90" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                 <Bot size={16} />
             </div>
             <div className="bg-[#1e293b] border border-white/5 px-4 py-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center h-10">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-[#02040a] border-t border-white/5">
        <div className="relative group">
          <input
            type="text"
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-4 pr-12 py-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-0 disabled:scale-90 transition-all shadow-lg hover:shadow-indigo-500/30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;