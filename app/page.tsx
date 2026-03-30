"use client";

import { motion } from 'framer-motion';
import { MonitorPlay, Users, Wifi } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          SCREEN<span className="text-[#00f5ff] neon-text">SYNC</span>
        </h1>
        <p className="text-xl text-white/70 mb-12 font-mono">
          Hyper-fast P2P screen streaming. No installs. Direct browser connection.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          <Link href="/host">
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer group hover:bg-white/10 transition-all border border-transparent hover:border-[#00f5ff]/50"
            >
              <div className="bg-[#00f5ff]/10 p-4 rounded-2xl group-hover:bg-[#00f5ff]/20 transition-colors">
                <MonitorPlay size={40} className="text-[#00f5ff]" />
              </div>
              <h2 className="text-2xl font-bold">Host Session</h2>
              <p className="text-white/50 text-sm font-mono text-center">Share your screen & audio with perfect clarity</p>
            </motion.div>
          </Link>

          <Link href="/network">
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer group hover:bg-white/10 transition-all border border-transparent hover:border-[#a855f7]/50"
            >
              <div className="bg-[#a855f7]/10 p-4 rounded-2xl group-hover:bg-[#a855f7]/20 transition-colors">
                <Wifi size={40} className="text-[#a855f7]" />
              </div>
              <h2 className="text-2xl font-bold">Network Tools</h2>
              <p className="text-white/50 text-sm font-mono text-center">Diagnostics, IPs, & Custom Signaling Info</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
