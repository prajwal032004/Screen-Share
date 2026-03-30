"use client";

import { useEffect, useState } from 'react';
import NetworkPanel from '@/components/NetworkPanel';
import { Server, Zap } from 'lucide-react';

export default function NetworkPage() {
  const [interfaces, setInterfaces] = useState([]);
  const [portOpen, setPortOpen] = useState<boolean | null>(null);
  const [portInput, setPortInput] = useState('3001');
  const [loadingConfig, setLoadingConfig] = useState(false);
  
  // Connection API stats
  const [connectionType, setConnectionType] = useState('Checking...');
  const [rtt, setRtt] = useState(0);

  const fetchInterfaces = async () => {
    try {
      const res = await fetch('/api/network');
      const data = await res.json();
      setInterfaces(data);
    } catch(e) {
      console.error(e);
    }
  };

  const checkPort = async () => {
    setLoadingConfig(true);
    setPortOpen(null);
    try {
      const res = await fetch(`/api/check-port?port=${portInput}`);
      const data = await res.json();
      setPortOpen(data.open);
    } catch(e) {
      setPortOpen(false);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchInterfaces();
    checkPort();

    const interval = setInterval(fetchInterfaces, 5000);
    
    // Navigator network
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const conn: any = navigator.connection;
      setConnectionType(conn.effectiveType || 'unknown');
      setRtt(conn.rtt || 0);
      
      const updateConn = () => {
        setConnectionType(conn.effectiveType);
        setRtt(conn.rtt);
      };
      
      conn.addEventListener('change', updateConn);
      return () => {
        clearInterval(interval);
        conn.removeEventListener('change', updateConn);
      }
    }
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col items-center">
      <h1 className="text-4xl font-black mb-12 self-start flex items-center gap-3">
        <Server className="text-[#a855f7]" size={40} />
        System Diagnostics
      </h1>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <NetworkPanel interfaces={interfaces} />

        <div className="flex flex-col gap-8 w-full">
          <div className="glass-card p-6 rounded-2xl w-full">
            <h2 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-3 mb-6">
              <Zap className="text-yellow-400" />
              Client Connection
            </h2>
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
               <span className="text-white/60 font-mono">Effective Type</span>
               <span className="font-bold text-[#00f5ff] uppercase">{connectionType}</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl mt-4">
               <span className="text-white/60 font-mono">Est. RTT (ms)</span>
               <span className="font-bold text-[#00f5ff]">{rtt} ms</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl w-full">
             <h2 className="text-xl font-bold font-mono tracking-tight text-white mb-6 bg-gradient-to-r from-[#00f5ff] to-[#a855f7] bg-clip-text text-transparent">
              Signaling Port Checker
            </h2>
             <div className="flex items-center gap-3">
               <input 
                 type="text" 
                 value={portInput}
                 onChange={(e) => setPortInput(e.target.value)}
                 className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f5ff]/50 font-mono text-[#00f5ff] w-32" 
               />
               <button 
                 onClick={checkPort}
                 disabled={loadingConfig}
                 className="flex-1 bg-[#a855f7]/20 hover:bg-[#a855f7]/40 border border-[#a855f7]/50 text-white font-bold py-3 rounded-xl transition"
               >
                 Test Port
               </button>
             </div>
             
             {portOpen !== null && (
               <div className={`mt-4 p-4 rounded-xl border font-bold flex items-center justify-center font-mono ${portOpen ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                 {portOpen ? `Port ${portInput} is OPEN` : `Port ${portInput} is CLOSED`}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
