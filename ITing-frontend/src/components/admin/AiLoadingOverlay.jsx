import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const AiLoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="absolute -inset-16 animate-pulse opacity-30">
          <div className="w-64 h-64 rounded-full border-4 border-dashed border-sky-400 rotate-180"></div>
        </div>
        <div className="absolute -inset-12 animate-spin duration-[3000ms] opacity-20">
          <div className="w-56 h-56 rounded-full border-2 border-dashed border-white"></div>
        </div>

        {/* AI Icon Container */}
        <div className="relative bg-white p-8 rounded-3xl shadow-2xl shadow-sky-500/20 animate-bounce-slow">
          <div className="absolute -top-2 -right-2">
            <div className="bg-gradient-to-tr from-sky-400 to-blue-600 p-2 rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
          
          <Bot className="w-20 h-20 text-sky-500" />
        </div>

        {/* Text Section */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-black text-white tracking-tight mb-3 drop-shadow-md">
            Gemini AI <span className="text-sky-400">đang phân định...</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" 
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="mt-6 text-slate-300 font-medium text-lg bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
            Đang phân tích độ an toàn và hợp pháp của nội dung
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AiLoadingOverlay;
