"use client";
import React, { useRef, useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface AccordionItemProps {
  index: number;
  title: string;
  isOpen: boolean;
  onToggle: (title: string, key: number) => void;
  onClick: (title: string) => void;
  isLoading: boolean;
  children?: React.ReactNode;
  color?: string;
  isActive?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  index,
  title,
  children,
  isOpen,
  onToggle,
  onClick,
  isLoading,
  color,
  isActive = false,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");
  const [opacity, setOpacity] = useState(0);

  const updateHeight = () => {
    if (isOpen) {
      if (isLoading) {
        setHeight("60px");
      } else {
        if (contentRef.current) {
          setHeight(`${contentRef.current.scrollHeight}px`);
        }
      }
      setTimeout(() => setOpacity(1), 150);
    } else {
      setHeight("0px");
      setOpacity(0);
    }
  };

  useEffect(() => {
    updateHeight();
  }, [isOpen, children, isLoading]);

  return (
    <div className="mb-3 relative group">
      <div
        className={`
          relative overflow-hidden rounded-2xl transition-all duration-300
          ${
            isActive
              ? "bg-gradient-to-r from-purple-500/20 to-purple-700/20 border border-purple-500/50 shadow-lg shadow-purple-500/20"
              : "bg-white/5 border border-white/10 hover:bg-white/8 hover:border-purple-500/30"
          }
        `}
      >
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer" />
        </div>

        {/* Main content row */}
        <div className="relative z-10 p-4 flex items-center justify-between">
          {/* Left section with number badge */}
          <div className="flex items-center gap-4">
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
              ${
                isActive
                  ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/50"
                  : "bg-white/10 text-white/70 group-hover:bg-white/15"
              }
            `}
            >
              {index + 1}
            </div>

            {/* Song title - clickable */}
            <button
              onClick={() => onClick(title)}
              className="text-left transition-all duration-200 hover:translate-x-1"
            >
              <h3
                className={`
                font-medium transition-colors duration-200
                ${
                  isActive
                    ? "text-white"
                    : "text-white/90 group-hover:text-white"
                }
              `}
              >
                {title}
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Click to play</p>
            </button>
          </div>

          {/* Right section with expand button */}
          <button
            onClick={() => onToggle(title, index)}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
              ${
                isOpen
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              }
            `}
          >
            <ChevronDownIcon
              className={`
                w-5 h-5 transition-transform duration-300
                ${isOpen ? "rotate-180" : "rotate-0"}
              `}
            />
          </button>
        </div>

        {/* Expandable content */}
        <div
          ref={contentRef}
          style={{ height, opacity }}
          className="overflow-hidden transition-all duration-300 ease-out"
        >
          <div className="px-4 pb-4">
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

            {/* Content wrapper with glass effect */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="flex gap-2">
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="ml-3 text-white/50 text-sm">
                    Loading data...
                  </span>
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect when active */}
      {isActive && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-700/20 rounded-2xl blur-xl -z-10 animate-pulse" />
      )}
    </div>
  );
};

export default AccordionItem;
