"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PauseIcon,
  PlayIcon,
  ArrowPathIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SongData from "./songData";
import AppLayout from "@/components/AppLayout";

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
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const setSongsObj = useCallback(() => {
    const newSongObj: SongObj = {};
    songs.forEach((song) => {
      const name = song.properties.Song.title[0].text.content;
      const url = song.properties.Link.url;
      newSongObj[name] = url;
    });
    setSongObj(newSongObj);
  }, [songs]);

  useEffect(() => {
    setSongsObj();
  }, [setSongsObj]);

  const onClick = (title: string, index: number) => {
    setCurrentSong(title);
    setCurrentSongIndex(index);
    if (songObj) {
      setCurrentLink(songObj[title]);
    }
  };

  useEffect(() => {
    if (audioRef.current && currentLink) {
      const audio = audioRef.current;
      audio.src = currentLink;
      audio.load();

      // 메타데이터 로드 후 재생 시도
      const handleCanPlay = () => {
        playMusic();
        audio.removeEventListener('canplay', handleCanPlay);
      };

      audio.addEventListener('canplay', handleCanPlay);

      // 클린업
      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
      };
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

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleLoadingChange = useCallback(
    (index: number, isLoading: boolean) => {
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [index]: isLoading,
      }));
    },
    []
  );

  const fetchData = async (cursor?: string, limit?: number) => {
    if (loading) return; // 이미 로딩 중이면 중복 요청 방지

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursor) params.append("start_cursor", cursor);
      if (limit) params.append("limit", limit.toString());

      const response = await fetch(`/api/songlist?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();

      if (cursor) {
        // 추가 데이터 로드 (무한 스크롤)
        setSongs((prevSongs) => [...prevSongs, ...json.results]);
      } else {
        // 초기 데이터 로드
        setSongs(json.results);
      }

      setHasMore(json.has_more);
      setStartCursor(json.next_cursor);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  // 초기 로드
  useEffect(() => {
    fetchData(undefined, limit);
  }, []);

  // 페이지 변경 시 추가 데이터 로드
  useEffect(() => {
    if (page > 0 && hasMore && !loading) {
      fetchData(startCursor, limit);
    }
  }, [page]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && hasMore) {
        console.log("Loading next page..."); // 디버깅용
        setPage((prevPage) => prevPage + 1);
      }
    },
    [loading, hasMore]
  );

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
  }, [handleObserver]);

  const playMusic = async (): Promise<void> => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('재생 실패:', error);
      setIsPlaying(false);
      // 사용자에게 재생 버튼을 누르도록 유도
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.log('사용자 상호작용이 필요합니다. 재생 버튼을 눌러주세요.');
      }
    }
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

  // 현재 곡 처음부터 재생
  const restartCurrentSong = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        playMusic();
      }
    }
  };

  // 다운로드 모달 열기
  const openDownloadModal = () => {
    if (!currentSong || !currentLink) {
      alert("재생 중인 곡이 없습니다.");
      return;
    }
    setShowDownloadModal(true);
    setPasswordInput("");
    setPasswordError("");
  };

  // 다운로드 모달 닫기
  const closeDownloadModal = () => {
    setShowDownloadModal(false);
    setPasswordInput("");
    setPasswordError("");
    setIsDownloading(false);
  };

  // 비밀번호 확인 및 다운로드
  const handleDownload = async () => {
    if (!currentLink || !currentSong) {
      setPasswordError("다운로드할 곡이 없습니다.");
      return;
    }

    setIsDownloading(true);

    try {
      // API 라우트를 통해 다운로드
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: currentLink,
          filename: currentSong,
          password: passwordInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "다운로드에 실패했습니다.");
      }

      // 파일 다운로드
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${currentSong}.mp3`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Blob URL 해제
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      closeDownloadModal();
    } catch (error) {
      console.error("Download failed:", error);
      setPasswordError(
        error instanceof Error ? error.message : "다운로드에 실패했습니다."
      );
      setIsDownloading(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AppLayout showNav={true}>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:py-4">
        {/* Player Section */}
        <div
          className="lg:w-5/12 flex flex-col justify-center lg:py-6 lg:pr-6 lg:border-r "
          style={{ borderColor: "var(--border-glass)" }}
        >
          {/* Album Art Section */}
          <div className="text-center mb-8 lg:mb-10">
            <div
              className="w-64 h-64 lg:w-72 lg:h-72 mx-auto mb-6 rounded-3xl flex items-center justify-center animate-pulse-custom cursor-pointer group"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 20px 60px var(--card-shadow)",
              }}
            >
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
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {currentSong || "Select a Song"}
            </h1>
          </div>

          {/* Hidden Audio Element */}
          <audio ref={audioRef} className="hidden" preload="auto" />

          {/* Progress Bar */}
          <div className="mb-8">
            <div
              className="h-3 rounded-full overflow-hidden cursor-pointer border"
              style={{
                backgroundColor: "var(--progress-track)",
                borderColor: "var(--border-glass)",
              }}
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full relative transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  background: "var(--gradient-primary)",
                }}
              >
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg"
                  style={{
                    backgroundColor: "var(--gradient-text)",
                    boxShadow: "0 0 20px var(--card-shadow)",
                  }}
                />
              </div>
            </div>
            <div
              className="flex justify-between mt-2 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center items-center gap-6 mb-10">
            <button
              onClick={restartCurrentSong}
              className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15"
              title="처음부터 재생"
            >
              <ArrowPathIcon
                className="w-6 h-6"
                style={{ color: "var(--text-primary)" }}
              />
            </button>
            <button
              onClick={playPrevious}
              className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15"
            >
              <ChevronLeftIcon
                className="w-6 h-6"
                style={{ color: "var(--text-primary)" }}
              />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 10px 30px var(--card-shadow)",
              }}
            >
              {isPlaying ? (
                <PauseIcon
                  className="w-8 h-8"
                  style={{ color: "var(--text-primary)" }}
                />
              ) : (
                <PlayIcon
                  className="w-8 h-8 ml-1"
                  style={{ color: "var(--text-primary)" }}
                />
              )}
            </button>
            <button
              onClick={playNext}
              className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15"
            >
              <ChevronRightIcon
                className="w-6 h-6"
                style={{ color: "var(--text-primary)" }}
              />
            </button>
            <button
              onClick={openDownloadModal}
              className="w-12 h-12 rounded-full glass-effect flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/15"
              title="다운로드"
            >
              <MusicalNoteIcon
                className="w-6 h-6"
                style={{ color: "var(--text-primary)" }}
              />
            </button>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="lg:w-7/12 mt-8 lg:mt-0 lg:py-6">
          <div className="lg:h-full flex flex-col min-h-0">
            <h2
              className="text-lg font-semibold mb-5 flex items-center"
              style={{ color: "var(--text-primary)" }}
            >
              Playlist
              <div
                className="flex-1 h-px bg-gradient-to-r to-transparent ml-4"
                style={{
                  background: `linear-gradient(to right, var(--play list-divider), transparent)`,
                }}
              />
            </h2>
            <div className="max-h-96 lg:flex-1 lg:max-h-[48rem] overflow-y-auto scroll-container pr-2 pt-1">
              {songs.map((song, index) => {
                const name = song.properties.Song.title[0].text.content;
                const isActive = currentSongIndex === index;
                return (
                  <div key={index}>
                    <div
                      className="relative flex items-center p-4 mb-3 rounded-2xl cursor-pointer transition-all duration-300 playlist-item-slide border"
                      style={{
                        background: isActive
                          ? "var(--playlist-item-active)"
                          : "var(--playlist-item-bg)",
                        borderColor: isActive
                          ? "rgba(96, 165, 250, 0.4)"
                          : "var(--border-glass)",

                        boxShadow: isActive
                          ? "0 4px 20px var(--card-shadow)"
                          : "0 2px 10px var(--card-shadow)",
                        // transform: isActive ? "translateY(-1px)" : "translateY(0)",
                      }}
                    >
                      <div
                        onClick={() => onClick(name, index)}
                        className="flex items-center flex-1"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold mr-4"
                          style={{
                            background: isActive
                              ? "var(--gradient-primary)"
                              : "var(--surface-glass)",
                          }}
                        >
                          <span
                            style={{
                              color: isActive
                                ? "var(--text-primary)"
                                : "var(--text-secondary)",
                            }}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div
                            className="text-sm font-medium mb-1"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {name}
                          </div>
                        </div>
                      </div>

                      {/* Info Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(index);
                        }}
                        className="ml-2 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${
                            openIndex === index ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Accordion for SongData */}
                    {openIndex === index && (
                      <div className="mb-3 p-4 glass-effect rounded-xl shadow-xl border border-white/20">
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
                <div
                  className="p-4 rounded-2xl skeleton-loading text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Loading more songs...
                </div>
              )}

              {/* Infinite Scroll Observer - 스크롤 컨테이너 안에 위치 */}
              {hasMore && <div id="observer" className="h-1" />}
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                <MusicalNoteIcon
                  className="w-8 h-8"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                곡 다운로드
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {currentSong}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  비밀번호 입력
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleDownload()}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface-glass)",
                    borderColor: "var(--border-glass)",
                    color: "var(--text-primary)",
                  }}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-400 text-xs mt-2">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeDownloadModal}
                  disabled={isDownloading}
                  className="flex-1 py-3 px-4 rounded-xl border font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--surface-glass)",
                    borderColor: "var(--border-glass)",
                    color: "var(--text-primary)",
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#667eea]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      다운로드 중...
                    </>
                  ) : (
                    "다운로드"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Player;
