import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SideNav from '@/components/sidebar/SideNav';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from '@clerk/nextjs';

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
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} h-full antialiased`}>
          <div className="flex flex-col h-screen overflow-hidden ">
            {/* 🔒 LOGGED OUT */}
            <SignedOut>
              {/* Top Banner */}
              <header className="bg-[#212121]  text-white px-6 py-4 flex items-center justify-between shadow-md">
                <h1 className="text-xl font-semibold">ChatGPT</h1>
                <div className="space-x-4 ">
                  <SignInButton>
                    <button className="px-4 py-2 hover:cursor-pointer bg-white text-black rounded-3xl">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="px-4 py-2 hover:cursor-pointer rounded-3xl text-white bg-transparent border-2 border-gray-800">
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-auto bg-gray-800 text-white">
                {children}
              </main>
            </SignedOut>

            {/* ✅ LOGGED IN */}
            <SignedIn>
              <div className="flex flex-row h-full">
                {/* Sidebar */}
                <SideNav />

                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gray-800 text-white">
                  {children}
                </div>
              </div>
            </SignedIn>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
