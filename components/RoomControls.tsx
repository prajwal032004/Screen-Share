import { Layout } from 'lucide-react';
import { ReactNode } from 'react';

export default function RoomControls({ onStop, children }: { onStop: () => void; children?: ReactNode }) {
  return (
    <div className="glass-card mt-6 p-4 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onStop}
          className="bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white px-6 py-2 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          Stop Sharing
        </button>
      </div>
      <div className="flex gap-2">
        {children}
      </div>
    </div>
  );
}
