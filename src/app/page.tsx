import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { MusicalNoteIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <AppLayout title="ESMP" showNav={true}>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div 
          className="w-32 h-32 mx-auto mb-6 rounded-3xl flex items-center justify-center animate-pulse-custom"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 20px 60px var(--card-shadow)',
          }}
        >
          <MusicalNoteIcon className="w-16 h-16" style={{ color: 'var(--text-primary)' }} />
        </div>
        <h2 className="text-lg mb-8 font-medium" style={{ color: 'var(--text-secondary)' }}>
          Experience Music in a New Way
        </h2>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/trackfinder">
          <div className="group cursor-pointer">
            <div 
              className="glass-effect rounded-2xl p-6 transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: '0 10px 40px var(--card-shadow)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <MagnifyingGlassIcon className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Track Finder</h3>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Discover new music</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Explore and filter through our extensive music collection with advanced search capabilities.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/player">
          <div className="group cursor-pointer">
            <div 
              className="glass-effect rounded-2xl p-6 transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: '0 10px 40px var(--card-shadow)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  style={{ background: 'var(--gradient-secondary)' }}
                >
                  <MusicalNoteIcon className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>MP3 Player</h3>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Listen & enjoy</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                High-quality music player with playlist support and beautiful visualizations.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Built with Next.js • Powered by Notion
        </p>
      </div>
    </AppLayout>
  );
}
