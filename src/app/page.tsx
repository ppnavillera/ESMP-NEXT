"use client";

import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  return (
    <AppLayout showNav={true}>
      {/* Hero Section */}
      <div className="text-center mb-12">
        {/* Enhanced ESMP Title - Neon Glitch Style */}
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-black mb-6 title-subtle-3d">
            ESMP
          </h1>

          {/* Glitch effect pseudo elements */}
          <h1
            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl md:text-8xl font-black mb-6 z-0"
            style={{
              color: "transparent",
              left: "calc(50% - 2px)",
              textShadow: "2px 0 #667eea",
              animation: "glitch-anim-1 2s infinite linear alternate-reverse",
              overflow: "hidden",
              clipPath: "polygon(0 42px, 100% 44px, 100% 44px, 0 42px)",
            }}
          >
            ESMP
          </h1>

          <h1
            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl md:text-8xl font-black mb-6 z-0"
            style={{
              color: "transparent",
              left: "calc(50% + 2px)",
              textShadow: "-2px 0 #f5576c",
              animation: "glitch-anim-2 3s infinite linear alternate-reverse",
              overflow: "hidden",
              clipPath: "polygon(0 12px, 100% 60px, 100% 60px, 0 12px)",
            }}
          >
            ESMP
          </h1>
        </div>

        <div
          className="w-32 h-32 mx-auto mb-6 rounded-3xl flex items-center justify-center animate-pulse-custom"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: "0 20px 60px var(--card-shadow)",
          }}
        >
          <MusicalNoteIcon
            className="w-16 h-16"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <div className="relative">
          <h2
            className="text-lg mb-8 font-medium relative z-10"
            style={{
              background:
                "linear-gradient(135deg, var(--text-secondary) 0%, var(--text-primary) 50%, #f093fb 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              animation: "textShimmer 3s ease-in-out infinite",
            }}
          >
            {/* ESMP Music Archive. <br /> */}
            작곡팀 ESMP의{" "}
            <span
              className="font-bold"
              style={{
                background: "var(--gradient-secondary)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              공식 음악 아카이브
            </span>
            입니다.
            <br />
            ESMP가 만든 모든 곡을 한 곳에서 만나보세요
          </h2>

          <style jsx>{`
            @keyframes textShimmer {
              0%,
              100% {
                background-position: 0% 50%;
                opacity: 0.8;
              }
              50% {
                background-position: 100% 50%;
                opacity: 1;
              }
            }
          `}</style>

          <div
            className="w-24 h-1 mx-auto mt-8 rounded-full fade-in-up"
            style={{
              background: "var(--gradient-primary)",
              animationDelay: "0.4s",
            }}
          ></div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/trackfinder">
          <div className="group cursor-pointer">
            <div
              className="glass-effect rounded-2xl p-6 transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: "0 10px 40px var(--card-shadow)",
              }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <MagnifyingGlassIcon
                    className="w-6 h-6"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Track Finder
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Discover new music
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                ESMP의 다양한 음악을 필터링하여 원하는 곡을 쉽게 찾아보세요.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/player">
          <div className="group cursor-pointer">
            <div
              className="glass-effect rounded-2xl p-6 transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: "0 10px 40px var(--card-shadow)",
              }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  style={{ background: "var(--gradient-secondary)" }}
                >
                  <MusicalNoteIcon
                    className="w-6 h-6"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    MP3 Player
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Listen & enjoy
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                원하는 곡을 선택하여 즉시 감상하고, 상세 정보를 확인해 보세요.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Built with Next.js • Powered by Notion
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)", opacity: 0.7 }}>
          Created by aeona
        </p>
      </div>
    </AppLayout>
  );
}
