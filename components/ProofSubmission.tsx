
import React, { useState, useEffect } from 'react';
import { X, Scan, CheckCircle2, Search, Star } from 'lucide-react';

interface ProofSubmissionProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ProofSubmission: React.FC<ProofSubmissionProps> = ({ onConfirm, onCancel }) => {
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'ANALYZING' | 'GRADING' | 'SUCCESS'>('IDLE');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setStatus('SCANNING');
    }
  };

  useEffect(() => {
    if (status === 'SCANNING') {
        setTimeout(() => setStatus('ANALYZING'), 1500);
    }
    if (status === 'ANALYZING') {
        setTimeout(() => setStatus('GRADING'), 2000); // Simulate AI Checking
    }
    if (status === 'GRADING') {
        // Just visual pause before final callback which shows the result modal in App.tsx
        setTimeout(() => {
            onConfirm(); // App.tsx handles the actual "Mission Result" modal
        }, 1000); 
    }
  }, [status, onConfirm]);

  return (
    <div className="fixed inset-0 z-[1100] bg-black flex flex-col items-center justify-center font-mono">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
               backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent)',
               backgroundSize: '50px 50px'
           }}
      ></div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
          <div className="text-[10px] text-cyan-500 bg-cyan-950/50 px-2 py-1 border border-cyan-800 rounded">
              PROOF_UPLOAD_PROTOCOL_V3
          </div>
          <button onClick={onCancel} className="text-red-500 hover:text-red-400 p-2 border border-red-900/50 bg-red-950/20 rounded-full">
              <X className="w-5 h-5" />
          </button>
      </div>

      {/* Main Scanner UI */}
      <div className="relative w-full max-w-sm aspect-[3/4] border-2 border-slate-800 bg-slate-900/40 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-1">
         {/* Corner Brackets */}
         <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500"></div>
         <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500"></div>
         <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500"></div>
         <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500"></div>

         {/* Image Preview Layer */}
         {preview && (
             <img 
                src={preview} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${status === 'SUCCESS' ? 'opacity-100' : 'opacity-60 grayscale'}`} 
                alt="Scan" 
             />
         )}

         {/* Scanning Overlay Animation */}
         {(status === 'SCANNING' || status === 'ANALYZING') && (
            <div className="absolute inset-0 bg-cyan-500/10 z-10">
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite] border-t-cyan-400 border-t-2"></div>
                </div>
            </div>
         )}

         {/* Grading Overlay */}
         {status === 'GRADING' && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                 <div className="text-amber-500 animate-pulse mb-4">
                     <Search className="w-12 h-12" />
                 </div>
                 <div className="text-amber-500 font-bold tracking-[0.3em] text-lg font-['Cinzel']">AWAITING EVALUATION</div>
                 <div className="text-xs text-slate-400 mt-2">Connecting to Employer Neural Net...</div>
             </div>
         )}

         {/* IDLE State / Input Trigger */}
         {status === 'IDLE' && (
             <label className="group relative w-40 h-40 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-950/30 transition-all z-10 active:scale-95">
                 <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                 <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-shadow">
                    <Scan className="w-10 h-10 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                 </div>
                 <div className="absolute -bottom-10 text-center w-full">
                     <div className="text-cyan-500 font-bold tracking-widest text-sm animate-pulse">INITIATE SCAN</div>
                 </div>
             </label>
         )}

         {/* Status Text HUD */}
         {status !== 'GRADING' && status !== 'IDLE' && (
            <div className="absolute bottom-12 left-0 right-0 text-center z-10">
                {status === 'SCANNING' && <div className="text-xs text-cyan-400 font-bold bg-black/50 inline-block px-3 py-1 rounded border border-cyan-900">ACQUIRING GEOSPATIAL DATA...</div>}
                {status === 'ANALYZING' && <div className="text-xs text-emerald-400 font-bold bg-black/50 inline-block px-3 py-1 rounded border border-emerald-900">VERIFYING CONTENTS...</div>}
            </div>
         )}

      </div>

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ProofSubmission;
