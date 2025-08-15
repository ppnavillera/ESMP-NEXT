"use client";

import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ReactNode } from "react";
import ThemeToggle from "./ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
}

export default function AppLayout({
  children,
  title,
  showNav = true,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-5xl animate-slide-up ">
        <div className="glass-effect rounded-[30px] p-8 md:p-10 shadow-2xl">
          {/* Navigation Header */}
          {showNav && (
            <div className="flex justify-between items-center mb-8">
              <Link href="/">
                <button className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#667eea] hover:shadow-[0_0_40px_rgba(102,126,234,0.5)]">
                  <HomeIcon
                    className="w-6 h-6"
                    style={{ color: "var(--text-primary)" }}
                  />
                </button>
              </Link>
              <ThemeToggle />
            </div>
          )}

          {/* Page Title */}
          {title && (
            <div className="text-center mb-10">
              <h1
                className="text-3xl font-bold mb-2 animate-shimmer"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h1>
            </div>
          )}

          {/* Page Content */}
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
