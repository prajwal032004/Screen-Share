import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'ScreenSync | P2P Screen Sharing',
  description: 'Real-Time Web Screen Sharing Platform via WebRTC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen relative font-sans">
        <div className="bg-mesh" />
        <main className="relative z-10 w-full min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
