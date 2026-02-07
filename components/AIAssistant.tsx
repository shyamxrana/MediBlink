import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { getDoctorRecommendations } from '../services/geminiService';
import { DOCTORS } from '../services/mockDataClient';
import { ChatMessage, Doctor } from '../types';

interface AIAssistantProps {
  onDoctorSelect: (doctorId: string) => void;
  className?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onDoctorSelect, className }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your MediBlink AI Assistant. Describe your symptoms or what you're looking for, and I'll recommend the best specialist for you."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await getDoctorRecommendations(input, DOCTORS);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message,
        suggestedDoctorIds: result.recommendedDoctorIds
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try searching manually."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col bg-[#0C4A6E] rounded-2xl shadow-xl overflow-hidden border border-slate-200 ${className ?? 'h-[600px]'}`}>
      {/* Header */}
      <div className="bg-primary-600 p-4 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">MediBlink AI Triage</h3>
            <p className="text-xs text-primary-100">Powered by Gemini 3</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 ${msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-teal-100 text-teal-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
              }`}>
                <p>{msg.content}</p>
                
                {/* Render Suggested Doctors Cards if available */}
                {msg.suggestedDoctorIds && msg.suggestedDoctorIds.length > 0 && (
                  <div className="mt-4 grid gap-2">
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Recommended Specialists</p>
                    {msg.suggestedDoctorIds.map(id => {
                      const doc = DOCTORS.find(d => d.id === id);
                      if (!doc) return null;
                      return (
                        <div key={id} className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors">
                          <div className="flex items-center space-x-2">
                            <img src={doc.image} alt={doc.name} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{doc.name}</p>
                              <p className="text-[10px] text-slate-500">{doc.specialty}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => onDoctorSelect(id)}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded hover:bg-primary-200"
                          >
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 ml-12">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 px-4 py-2 border-t border-yellow-100 flex items-start gap-2 flex-shrink-0">
         <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
         <p className="text-[10px] text-yellow-800">
           AI recommendations are for informational purposes only and do not replace professional medical advice.
         </p>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your symptoms..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-400"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="sm" className="w-12">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};