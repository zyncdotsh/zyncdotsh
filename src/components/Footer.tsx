"use client";

import { TwitterLogo, LinkedinLogo, GithubLogo } from "phosphor-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-4">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-1"></div>
          <p className="text-xs text-gray-600 font-bold text-center flex-1">
            All rights reserved{" "}
            <a 
              href="https://twitter.com/zyncdotsh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700"
            >
              @zyncdotsh
            </a>
          </p>
          <div className="flex items-center gap-3 justify-end flex-1">
            <a 
              href="https://twitter.com/zyncdotsh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-600 transition-colors"
              title="Twitter"
            >
              <TwitterLogo size={20} weight="bold" />
            </a>
            <a 
              href="https://www.linkedin.com/in/simba-masters-b03a20232/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-600 transition-colors"
              title="LinkedIn"
            >
              <LinkedinLogo size={20} weight="bold" />
            </a>
            <a 
              href="https://github.com/zyncdotsh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-600 transition-colors"
              title="GitHub"
            >
              <GithubLogo size={20} weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
