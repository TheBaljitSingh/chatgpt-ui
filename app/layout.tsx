import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SideNav from '@/components/sidebar/SideNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A pixel-perfect ChatGPT clone built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-gray-800`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <SideNav />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-gray-800 relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}