"use client";

import { useState, useEffect, useRef } from "react";
import {
  HomeIcon,
  PauseIcon,
  PlayIcon,
  ArrowPathIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import SongData from "./songData";
import AccordionItem from "./AccordionItem";
import { useRouter } from "next/navigation";

interface SongObj {
  [key: string]: string;
}

interface Song {
  properties: {
    Song: {
      title: { text: { content: string } }[];
    };
    Link: {
      url: string;
    };
  };
}

const Player = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [startCursor, setStartCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const limit = 15;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [songObj, setSongObj] = useState<SongObj>();
  const [currentSong, setCurrentSong] = useState<string>();
  const [currentLink, setCurrentLink] = useState<string>();
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const router = useRouter();

  const setSongsObj = () => {
    const newSongObj: SongObj = {};
    songs.forEach((song) => {
      const name = song.properties.Song.title[0].text.content;
      const url = song.properties.Link.url;
      newSongObj[name] = url;
    });
    setSongObj(newSongObj);
  };

  useEffect(() => {
    setSongsObj();
  }, [songs]);

  const onClick = (title: string, index: number) => {
    setCurrentSong(title);
    setCurrentSongIndex(index);
    if (songObj) {
      setCurrentLink(songObj[title]);
    }
  };

  useEffect(() => {
    if (audioRef.current && currentLink) {
      audioRef.current.src = currentLink;
      audioRef.current.load();
      playMusic();
    }
  }, [currentLink]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", () => setIsPlaying(true));
      audio.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, []);

  const handleToggle = (title: string, index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleLoadingChange = (index: number, isLoading: boolean) => {
    setLoadingStates((prevStates) => ({
      ...prevStates,
      [index]: isLoading,
    }));
  };

  const fetchData = async (cursor?: string, limit?: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/songlist?start_cursor=${cursor || ""}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();
      setSongs((prevSongs) => [...prevSongs, ...json.results]);
      setHasMore(json.has_more);
      setStartCursor(json.next_cursor);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (hasMore) {
      fetchData(startCursor, limit);
    }
  }, [page]);

  const handleObserver = (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0,
    });
    const observerTarget = document.getElementById("observer");
    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [loading, hasMore]);

  const playMusic = (): void => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const pauseMusic = (): void => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const playPrevious = () => {
    if (currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1;
      const prevSong = songs[prevIndex];
      if (prevSong) {
        const name = prevSong.properties.Song.title[0].text.content;
        onClick(name, prevIndex);
      }
    }
  };

  const playNext = () => {
    if (currentSongIndex < songs.length - 1) {
      const nextIndex = currentSongIndex + 1;
      const nextSong = songs[nextIndex];
      if (nextSong) {
        const name = nextSong.properties.Song.title[0].text.content;
        onClick(name, nextIndex);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <style jsx global>{`
        @keyframes floatingGradient {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          33% {
            transform: rotate(120deg) scale(1.1);
          }
          66% {
            transform: rotate(240deg) scale(0.95);
          }
        }
        @keyframes holographic {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        @keyframes shimmer {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes dance {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-float {
          animation: floatingGradient 20s ease infinite;
        }
        .animate-holographic {
          animation: holographic 3s linear infinite;
        }
        .animate-pulse-custom {
          animation: pulse 4s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        .visualizer-bar {
          animation: dance 1s ease-in-out infinite;
        }
        .visualizer-bar.paused {
          animation-play-state: paused;
        }
        .skeleton-loading {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
        }
        .glass-effect {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05)
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .scroll-container::-webkit-scrollbar {
          width: 4px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 2px;
        }
        .playlist-item-slide::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(102, 126, 234, 0.3),
            transparent
          );
          transition: left 0.5s ease;
        }
        .playlist-item-slide:hover::before {
          left: 100%;
        }
      `}</style>

      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 animate-float"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(245, 87, 108, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        <div className="w-full max-w-2xl animate-slide-up">
          <div className="glass-effect rounded-[30px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Holographic Effect Overlay */}
            <div
              className="absolute inset-0 pointer-events-none animate-holographic"
              style={{
                background: `linear-gradient(
                  45deg,
                  transparent,
                  rgba(102, 126, 234, 0.1),
                  transparent,
                  rgba(245, 87, 108, 0.1),
                  transparent
                )`,
              }}
            />

            {/* Navigation Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <Link href="/">
                <button className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#667eea] hover:shadow-[0_0_40px_rgba(102,126,234,0.5)]">
                  <HomeIcon className="w-6 h-6 text-white" />
                </button>
              </Link>
              <button className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Album Art Section */}
            <div className="text-center mb-10 relative z-10">
              <div className="w-72 h-72 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-[0_20px_60px_rgba(102,126,234,0.4)] animate-pulse-custom cursor-pointer group">
                <div className="flex items-end justify-center gap-1 h-32">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gradient-to-t from-white/30 to-white/80 rounded-sm visualizer-bar ${
                        !isPlaying ? "paused" : ""
                      }`}
                      style={{
                        height: `${40 + Math.random() * 40}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 animate-shimmer">
                {currentSong || "Select a Song"}
              </h1>
              <p className="text-white/70 text-sm">Choose from playlist</p>
            </div>

            {/* Hidden Audio Element */}
            <audio ref={audioRef} className="hidden" preload="auto">
              <source src={currentLink} type="audio/mpeg" />
            </audio>

            {/* Progress Bar */}
            <div className="mb-8 relative z-10">
              <div
                className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full relative transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(102,126,234,0.8)]" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center items-center gap-6 mb-10 relative z-10">
              <button className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15">
                <ArrowPathIcon className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={playPrevious}
                className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15"
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_10px_30px_rgba(102,126,234,0.5)] hover:shadow-[0_0_40px_rgba(102,126,234,0.5)]"
              >
                {isPlaying ? (
                  <PauseIcon className="w-8 h-8 text-white" />
                ) : (
                  <PlayIcon className="w-8 h-8 text-white ml-1" />
                )}
              </button>
              <button
                onClick={playNext}
                className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15"
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </button>
              <button className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15">
                <MusicalNoteIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Playlist Section */}
            <div className="relative z-10">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center">
                Playlist
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent ml-4" />
              </h2>
              <div className="max-h-96 overflow-y-auto scroll-container pr-2">
                {songs.map((song, index) => {
                  const name = song.properties.Song.title[0].text.content;
                  const isActive = currentSongIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => onClick(name, index)}
                      className={`
                        relative flex items-center p-4 mb-3 rounded-2xl cursor-pointer
                        transition-all duration-300 playlist-item-slide
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 border border-[#667eea]/50"
                            : "bg-white/5 border border-white/5 hover:bg-white/10 hover:translate-x-2 hover:border-[#667eea]/30"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold mr-4
                          ${
                            isActive
                              ? "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"
                              : "bg-white/10 text-white/70"
                          }
                        `}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white mb-1">
                          {name}
                        </div>
                        <div className="text-xs text-white/50">Artist Name</div>
                      </div>
                      <div className="text-xs text-white/50">3:45</div>

                      {/* Accordion for SongData */}
                      {openIndex === index && (
                        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/10 rounded-xl">
                          <SongData
                            name={name}
                            onLoadingChange={(isLoading) =>
                              handleLoadingChange(index, isLoading)
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {loading && (
                  <div className="p-4 rounded-2xl skeleton-loading text-center text-white/50">
                    Loading more songs...
                  </div>
                )}
              </div>
            </div>

            <div id="observer" className="h-1" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;
