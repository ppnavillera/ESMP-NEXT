"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15 group"
      title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <div className="relative w-6 h-6">
        {/* Dark Mode Icon (Moon) */}
        <MoonIcon 
          className={`
            absolute inset-0 w-6 h-6 transition-all duration-500 ease-in-out
            ${theme === 'dark' 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-75 rotate-180'
            }
          `}
          style={{ color: 'var(--text-primary)' }}
        />
        
        {/* Light Mode Icon (Sun) */}
        <SunIcon 
          className={`
            absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-500 ease-in-out
            ${theme === 'light' 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-75 -rotate-180'
            }
          `}
        />
      </div>
      
      {/* Hover effect glow */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${theme === 'dark' 
          ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
          : 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20'
        }
      `} />
    </button>
  );
}