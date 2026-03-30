const os = require('os');

function getNetworkInterfaces() {
  const nets = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Only include IPv4 for simplicity, or include both
      results.push({
        name,
        ip: net.address,
        family: net.family,
        mac: net.mac,
        netmask: net.netmask,
        internal: net.internal,
        broadcast: net.internal ? undefined : getBroadcastAddress(net.address, net.netmask)
      });
    }
  }
  return results;
}

function getBroadcastAddress(ip, netmask) {
  if (!ip || !netmask || ip.includes(':') || netmask.includes(':')) return undefined; // Skip IPv6
  
  const ipParts = ip.split('.').map(Number);
  const maskParts = netmask.split('.').map(Number);

  if (ipParts.length !== 4 || maskParts.length !== 4) return undefined;

  const broadcastParts = ipParts.map((part, i) => part | (~maskParts[i] & 255));
  return broadcastParts.join('.');
}

module.exports = { getNetworkInterfaces };
