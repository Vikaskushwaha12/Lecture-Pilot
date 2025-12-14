import React, { useState } from 'react';
import { LectureData } from '../types';
import { Clock, BookOpen, MessageSquare, BarChart2, CheckCircle, ChevronRight, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIChat from './AIChat';

interface DashboardProps {
  lecture: LectureData;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lecture, onReset }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'chat'>('notes');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lecture.title || 'Untitled Lecture'}</h1>
          <p className="text-gray-500 text-sm mt-1">Processed by Lecture Pilot</p>
        </div>
        <button 
          onClick={onReset}
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
        >
          Upload Another
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary & Structure */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Executive Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
              {lecture.summary}
            </p>
          </div>

          {/* Topics Timeline */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Key Topics & Timeline
            </h2>
            <div className="space-y-4">
              {lecture.segments.map((seg, idx) => (
                <div key={idx} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition group cursor-pointer">
                  <div className="flex-shrink-0 w-16 text-xs font-mono font-medium text-gray-500 bg-gray-100 rounded flex items-center justify-center h-8">
                    {seg.timestamp}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">{seg.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{seg.description}</p>
                  </div>
                  <ChevronRight className="ml-auto w-4 h-4 text-gray-300 group-hover:text-indigo-400 self-center" />
                </div>
              ))}
            </div>
          </div>

          {/* Complexity Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Concept Complexity Curve
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lecture.complexityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Estimated conceptual difficulty over time</p>
          </div>
        </div>

        {/* Right Column: Interactive Tabs */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-gray-100 p-1 rounded-xl flex mb-4">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === 'notes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Auto Notes
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === 'chat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                AI Tutor
              </button>
            </div>

            {activeTab === 'notes' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-yellow-50/50">
                  <h3 className="font-semibold text-gray-800">Exam Revision Points</h3>
                </div>
                <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                  {lecture.notes.map((section, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">{section.heading}</h4>
                      <ul className="space-y-2">
                        {section.points.map((point, pIdx) => (
                          <li key={pIdx} className="text-sm text-gray-600 flex gap-2 items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <AIChat lecture={lecture} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;