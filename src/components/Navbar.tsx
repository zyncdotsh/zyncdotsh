"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { CopySimple, SignOut, CaretDown } from "phosphor-react";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white border-b-2 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center">
            <a href="/" className="text-xl font-semibold text-gray-900">
              Zync
            </a>
          </div>
          
          <div className="flex items-center gap-6">
            {!isConnected && (
              <button
                onClick={openConnectModal}
                className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-bold cursor-pointer disabled:pointer-events-none disabled:opacity-60 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:translate-y-[1px] select-none bg-transparent text-black hover:bg-gray-100 h-9 px-4 py-2 border border-gray-300"
              >
                connect wallet
              </button>
            )}
            
            {isConnected && address && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer disabled:pointer-events-none disabled:opacity-60 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:translate-y-[1px] select-none bg-transparent text-black hover:bg-gray-100 h-9 px-4 py-2 border border-gray-300"
                >
                  <code className="text-xs font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </code>
                  <CaretDown size={16} weight="bold" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <div className="p-1">
                      <button
                        onClick={() => {
                          handleCopy();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-black hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <CopySimple size={16} weight="bold" />
                        {copied ? "Copied!" : "Copy Address"}
                      </button>
                      
                      <button
                        onClick={() => {
                          disconnect();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <SignOut size={16} weight="bold" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
