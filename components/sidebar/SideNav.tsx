'use client';

import React, { useState } from 'react';
import {
  Search,
  SquarePen,
  Edit3,
  Trash2,
  User,
  Settings,
  Menu,
  X,
  PanelLeft
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import ChatGPTLogo from '@/public/chatgpt.png'

// import Pannel from "@/public/pannel.svg"

export default function SideNav() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [isHoverOnLogo, setIsHoverOnLogo] = useState(false);
  const { user } = useUser();

  console.log(user);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) setIsHoverOnLogo(false);
  };

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const chats = [
    { id: '1', title: 'React component optimization', timestamp: '2 hours ago' },
    { id: '2', title: 'Next.js routing questions', timestamp: '1 day ago' },
    { id: '3', title: 'TypeScript best practices', timestamp: '2 days ago' },
    { id: '4', title: 'CSS Grid vs Flexbox', timestamp: '3 days ago' },
    { id: '5', title: 'Database design patterns', timestamp: '1 week ago' },
    { id: '6', title: 'API integration help', timestamp: '1 week ago' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r border-gray-700 transition-all duration-300 ease-in-out',
          'lg:relative fixed inset-y-0 left-0 z-50',
          isExpanded ? 'w-64 bg-[#181818]' : 'w-16 bg-[#212121]',
          isMobileOpen ? 'flex w-80' : 'hidden lg:flex'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center border-b border-gray-700 p-3',
          isExpanded ? 'justify-between' : 'justify-center '
        )}>
          {isExpanded ? (
            <>
              <Image
                src={ChatGPTLogo}
                alt="ChatGPT Logo"
                className="w-10 h-10 rounded"
              />
              <button
                onClick={toggleSidebar}
                className="p-2 text-white hover:bg-gray-800 rounded-lg hidden lg:block hover:cursor-e-resize"
                title="Collapse sidebar"
              >
                <Image style={{filter:"invert(1)"}} 

                 src='/pannel.svg alt="Panel Icon" width={24} height={24} />
                
              </button>
            </>
          ) : (
            <div>
              {isHoverOnLogo && typeof window !== 'undefined' && window.innerWidth > 768 ? (
                <button
                  onMouseEnter={() => setIsHoverOnLogo(true)}
                  onMouseLeave={() => setIsHoverOnLogo(false)}
                  onClick={toggleSidebar}
                  className="p-2 text-white hover:bg-gray-700 rounded-md hover:cursor-e-resize"
                  title="Expand sidebar"
                >
                <Image  style={{filter:"invert(1)"}}
                src='/pannel.svg' alt="Panel Icon" width={22} height={22} />
                  

                </button>
              ) : (
                <div onMouseEnter={() => setIsHoverOnLogo(true)}>
                  <Image
                    src={ChatGPTLogo}
                    alt="ChatGPT Logo"
                    className="w-10 h-10 rounded"
                  />
                </div>
              )}
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-white hover:bg-gray-800 rounded-lg lg:hidden ml-auto"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-1">
            {isExpanded ? (
              <>
                <button className="flex items-center gap-3 rounded-lg p-3 text-white hover:bg-gray-800 w-full">
                  <SquarePen size={20} />
                  <span className="text-sm font-medium">New chat</span>
                </button>
                <button className="flex items-center gap-3 rounded-lg p-3 text-white hover:bg-gray-800 w-full">
                  <Search size={20} />
                  <span className="text-sm font-medium">Search Chat</span>
                </button>
                <p className="text-gray-400 text-sm mt-2 mb-1">Chats</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <SquarePen className="text-white" size={20} />
                <Search className="text-white" size={20} />
              </div>
            )}

            {isExpanded && chats.map((chat) => (
              <div
                key={chat.id}
                className="group relative"
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
              >
                <button className="flex items-center gap-3 rounded-lg p-3 text-white hover:bg-gray-800 w-full text-left">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{chat.title}</p>
                  </div>
                </button>

                {/* Chat actions */}
                {hoveredChat === chat.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 bg-gray-800 rounded-lg p-1">
                    <button className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                      <Edit3 size={14} />
                    </button>
                    <button className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 p-3 space-y-2">
          {isExpanded ? (
            <div>
              <SignedOut>
                <div className="space-y-2">
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-3 rounded-lg p-3 text-white hover:bg-gray-800 w-full">
                      <User size={18} />
                      <span className="text-sm">Sign In</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-3 rounded-lg p-3 text-white hover:bg-gray-800 w-full">
                      <User size={18} />
                      <span className="text-sm">Sign Up</span>
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3 rounded-lg p-3 text-white hover:bg-gray-800 w-full">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                    showName={false}
                  />
                  <span className="text-sm">{user?.fullName}</span>
                </div>
              </SignedIn>
            </div>
          ) : (
            <div className="flex justify-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="p-3 text-white hover:bg-gray-800 rounded-lg">
                    <User size={18} />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      {!isMobileOpen && (
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-4 z-40 p-2 bg-gray-900 text-white rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
}