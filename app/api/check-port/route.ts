import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const portString = searchParams.get('port');
  
  if (!portString) {
    return NextResponse.json({ error: 'Port parameter is required' }, { status: 400 });
  }

  const port = parseInt(portString, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    return NextResponse.json({ error: 'Invalid port' }, { status: 400 });
  }

  // Very basic port check by trying to connect locally (Useful for localhost debugging)
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      resolve(NextResponse.json({ success: true, port, open: true }));
    });
    
    req.on('error', () => {
      resolve(NextResponse.json({ success: true, port, open: false }));
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(NextResponse.json({ success: true, port, open: false }));
    });
  });
}
