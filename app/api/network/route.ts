import { NextResponse } from 'next/server';
import os from 'os';

function getBroadcastAddress(ip: string, netmask: string) {
  if (!ip || !netmask || ip.includes(':') || netmask.includes(':')) return undefined;
  
  const ipParts = ip.split('.').map(Number);
  const maskParts = netmask.split('.').map(Number);

  if (ipParts.length !== 4 || maskParts.length !== 4) return undefined;

  const broadcastParts = ipParts.map((part, i) => part | (~maskParts[i] & 255));
  return broadcastParts.join('.');
}

export async function GET() {
  const nets = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    if(!nets[name]) continue;
    for (const net of nets[name]!) {
      if (net.family === 'IPv6') continue;
      results.push({
        name,
        ip: net.address,
        mac: net.mac,
        internal: net.internal,
        netmask: net.netmask,
        broadcast: net.internal ? undefined : getBroadcastAddress(net.address, net.netmask)
      });
    }
  }

  // Note: On Vercel, this will list internal cloud container interfaces, 
  // not the local LAN interfaces. It works flawlessly locally using `npm run dev`.
  return NextResponse.json(results);
}
