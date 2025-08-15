import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { MusicalNoteIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <AppLayout title="ESMP" showNav={false}>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-[0_20px_60px_rgba(102,126,234,0.4)] animate-pulse-custom">
          <MusicalNoteIcon className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-lg text-white/70 mb-8 font-medium">
          Experience Music in a New Way
        </h2>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/trackfinder">
          <div className="group cursor-pointer">
            <div className="glass-effect rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(102,126,234,0.3)]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mr-4">
                  <MagnifyingGlassIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Track Finder</h3>
                  <p className="text-white/60 text-sm">Discover new music</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">
                Explore and filter through our extensive music collection with advanced search capabilities.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/player">
          <div className="group cursor-pointer">
            <div className="glass-effect rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,87,108,0.3)]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f093fb] to-[#f5576c] flex items-center justify-center mr-4">
                  <MusicalNoteIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">MP3 Player</h3>
                  <p className="text-white/60 text-sm">Listen & enjoy</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">
                High-quality music player with playlist support and beautiful visualizations.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-white/50 text-sm">
          Built with Next.js • Powered by Notion
        </p>
      </div>
    </AppLayout>
  );
}
