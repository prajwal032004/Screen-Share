import { MonitorIcon, CopyIcon, WifiIcon } from 'lucide-react';

interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
}

export default function NetworkPanel({ interfaces }: { interfaces: NetworkInterface[] }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-card p-6 rounded-2xl w-full max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <MonitorIcon className="text-[#00f5ff]" />
        <h2 className="text-xl font-bold font-mono tracking-tight text-white">Network Diagnostics</h2>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {interfaces.length === 0 ? (
          <p className="text-white/60">Detecting interfaces...</p>
        ) : (
          interfaces.map((net, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <WifiIcon size={16} className="text-[#a855f7]" />
                  <span className="font-bold text-sm text-white/90 uppercase tracking-wider">{net.name}</span>
                </div>
                <div className="font-mono text-lg text-[#00f5ff]">{net.ip}</div>
                <div className="text-xs text-white/40 mt-1 uppercase font-mono">{net.mac}</div>
              </div>
              <button 
                onClick={() => copyToClipboard(net.ip)}
                className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-[#00f5ff]/20 text-[#00f5ff]"
              >
                <CopyIcon size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
