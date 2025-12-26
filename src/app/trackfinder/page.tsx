"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useFilterStore,
  ConfirmStatus,
  ToggleStatus,
  DateRange,
} from "@/stores/filterStore";

interface Song {
  properties: {
    Title: { title: { text: { content: string } }[] };
    멜로디메이커?: { multi_select: { name: string }[] };
    작사?: { multi_select: { name: string }[] };
    포스트프로덕션?: { multi_select: { name: string }[] };
    스케치트랙메이커?: { multi_select: { name: string }[] };
    마스터트랙메이커?: { multi_select: { name: string }[] };
    성별?: { select: { name: string } };
    완성일?: { date: { start: string } };
    확정?: { checkbox: boolean };
    Drop?: { checkbox: boolean };
    Rap?: { checkbox: boolean };
  };
}

interface Option {
  name: string;
  color: string;
}
interface Properties {
  [key: string]: string | { [name: string]: string };
}

type SortField = "title" | "date" | "status";
type SortOrder = "asc" | "desc";

// ===== 인메모리 캐시 (성능 최적화) =====
const cache: {
  tracks?: { data: Song[]; timestamp: number };
  properties?: { data: Properties; timestamp: number };
} = {};
const CACHE_DURATION = 3 * 60 * 1000; // 3분

export default function TrackFinder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Properties>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["status", "basic"])
  );
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [audioLink, setAudioLink] = useState<string | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // ===== 최적화를 위한 ref들 =====
  const [initialModalOpened, setInitialModalOpened] = useState(false);
  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    selectedFilters,
    buildNotionFilter,
    clearFilters,
    getActiveFilters,
    removeFilter,
    setConfirmStatus,
    setToggleFilter,
    setSelectFilter,
    setDateRangeFilter,
    toggleMultiSelectFilter,
  } = useFilterStore();

  const activeFilters = getActiveFilters();

  // 검색 + 정렬
  const sortedData = useMemo(() => {
    let filtered = data;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = data.filter((song) => {
        const title = song.properties.Title.title[0]?.text.content || "";
        return title.toLowerCase().includes(query);
      });
    }
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = (
            a.properties.Title.title[0]?.text.content || ""
          ).localeCompare(
            b.properties.Title.title[0]?.text.content || "",
            "ko"
          );
          break;
        case "date":
          comparison = (a.properties.완성일?.date?.start || "").localeCompare(
            b.properties.완성일?.date?.start || ""
          );
          break;
        case "status":
          comparison =
            (a.properties.확정?.checkbox ? 1 : 0) -
            (b.properties.확정?.checkbox ? 1 : 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder, searchQuery]);

  // ===== 트랙 데이터 fetch (캐싱 적용) =====
  const fetchTracks = useCallback(
    async (withFilter = false) => {
      if (fetchInProgress.current) return;

      // 필터 없는 요청은 캐시 확인
      if (!withFilter && cache.tracks) {
        const { data: cachedData, timestamp } = cache.tracks;
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(cachedData);
          return;
        }
      }

      fetchInProgress.current = true;
      setIsLoading(true);

      try {
        const filter = withFilter ? buildNotionFilter() : undefined;
        const resp = filter
          ? await fetch("/api/notion", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filter }),
            })
          : await fetch("/api/notion");

        if (resp.ok) {
          const respData = await resp.json();
          const tracks = respData.message
            ? []
            : Array.isArray(respData)
            ? respData
            : [];
          setData(tracks);
          if (!filter) cache.tracks = { data: tracks, timestamp: Date.now() };
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
        setData([]);
      } finally {
        setIsLoading(false);
        fetchInProgress.current = false;
      }
    },
    [buildNotionFilter]
  );

  // 속성 fetch (캐싱 적용)
  const fetchProps = useCallback(async () => {
    if (cache.properties) {
      const { data: cachedData, timestamp } = cache.properties;
      if (Date.now() - timestamp < CACHE_DURATION) {
        setProperties(cachedData);
        return;
      }
    }

    try {
      const resp = await fetch("/api/properties");
      const respData = await resp.json();
      const props = respData.properties;
      const newProperties: Properties = {};
      const order = [
        "완성일",
        "확정",
        "Drop",
        "Rap",
        "성별",
        "인원",
        "멜로디메이커",
        "포스트프로덕션",
        "스케치트랙메이커",
        "마스터트랙메이커",
        "작사",
      ];

      for (const key of order) {
        if (key in props) {
          if (["영어 제목", "가이드비", "Title"].includes(key)) continue;
          if (
            props[key].type === "multi_select" ||
            props[key].type === "select"
          ) {
            const values: { [name: string]: string } = {};
            const options =
              props[key].type === "multi_select"
                ? props[key].multi_select.options
                : props[key].select.options;
            options.forEach((el: Option) => {
              values[el.name] = el.color;
            });
            newProperties[key] = values;
          } else {
            newProperties[key] = props[key].type;
          }
        }
      }
      setProperties(newProperties);
      cache.properties = { data: newProperties, timestamp: Date.now() };
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  }, []);

  // ===== 단일 곡 fetch (URL 직접 접속 최적화) =====
  const fetchSingleTrack = useCallback(
    async (title: string): Promise<Song | null> => {
      try {
        const resp = await fetch(
          `/api/track?title=${encodeURIComponent(title)}`
        );
        if (resp.ok) return await resp.json();
      } catch (error) {
        console.error("Error fetching single track:", error);
      }
      return null;
    },
    []
  );

  // 오디오 링크 fetch
  const fetchAudioLink = useCallback(
    async (title: string): Promise<string | null> => {
      try {
        const response = await fetch("/api/get-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (response.ok) {
          const data = await response.json();
          return data.link;
        }
      } catch (error) {
        console.error("Error fetching audio link:", error);
      }
      return null;
    },
    []
  );

  // 모달 열기
  const openSongModalWithData = useCallback(
    async (song: Song, updateUrl: boolean = true) => {
      setSelectedSong(song);
      setAudioLink(null);
      setLoadingLink(true);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      const title = song.properties.Title.title[0]?.text.content;
      if (!title) {
        setLoadingLink(false);
        return;
      }

      if (updateUrl) {
        const params = new URLSearchParams(window.location.search);
        params.set("song", title);
        router.push(`?${params.toString()}`, { scroll: false });
      }

      const link = await fetchAudioLink(title);
      setAudioLink(link);
      setLoadingLink(false);
    },
    [router, fetchAudioLink]
  );

  // ===== 초기 로드: URL에 song 파라미터가 있으면 먼저 빠르게 모달 열기 =====
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const songTitle = searchParams.get("song");

    const init = async () => {
      // URL에 곡 제목이 있으면 단일 곡 API로 빠르게 모달 열기
      if (songTitle && !initialModalOpened) {
        setInitialModalOpened(true);
        const track = await fetchSingleTrack(songTitle);
        if (track) openSongModalWithData(track, false);
      }

      // 백그라운드에서 전체 데이터 로드
      fetchProps();
      fetchTracks();
    };

    init();
  }, [
    searchParams,
    initialModalOpened,
    fetchSingleTrack,
    openSongModalWithData,
    fetchProps,
    fetchTracks,
  ]);

  // 필터 변경 시 (초기 로드 제외)
  const isFirstFilterEffect = useRef(true);
  useEffect(() => {
    if (isFirstFilterEffect.current) {
      isFirstFilterEffect.current = false;
      return;
    }
    fetchTracks(true);
  }, [selectedFilters, fetchTracks]);

  // 모달 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = selectedSong ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedSong]);

  const closeSongModal = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setSelectedSong(null);
    setIsPlaying(false);
    router.push("/trackfinder", { scroll: false });
  }, [router]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    clearFilters();
    fetchTracks(false);
  }, [clearFilters, fetchTracks]);

  const handleSort = useCallback(
    (field: SortField) => {
      sortField === field
        ? setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
        : (setSortField(field), setSortOrder("desc"));
    },
    [sortField]
  );

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const formatTime = useCallback((time: number) => {
    if (isNaN(time)) return "0:00";
    return `${Math.floor(time / 60)}:${Math.floor(time % 60)
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const handleProgressDrag = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!progressRef.current || !audioRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      audioRef.current.currentTime = percent * duration;
      setCurrentTime(percent * duration);
    },
    [duration]
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDraggingProgress(true);
      handleProgressDrag(e);
    },
    [handleProgressDrag]
  );

  const handleVolumeDrag = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!volumeRef.current || !audioRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const newVolume = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  }, []);

  const handleVolumeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDraggingVolume(true);
      handleVolumeDrag(e);
    },
    [handleVolumeDrag]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress) handleProgressDrag(e);
      if (isDraggingVolume) handleVolumeDrag(e);
    };
    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDraggingProgress,
    isDraggingVolume,
    handleProgressDrag,
    handleVolumeDrag,
  ]);

  const participantFilters = [
    "멜로디메이커",
    "포스트프로덕션",
    "스케치트랙메이커",
    "마스터트랙메이커",
    "작사",
  ];
  const dateRange = (selectedFilters["완성일"] as DateRange) || {
    start: null,
    end: null,
  };

  const handleRowClick = useCallback(
    (song: Song) => (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
        e.preventDefault();
        openSongModalWithData(song, true);
      }
    },
    [openSongModalWithData]
  );

  // ===== 렌더링 =====
  return (
    <>
      <AppLayout disableAnimation={true}>
        <div className="min-h-[80vh]">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Track Finder
            </h1>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              ESMP 음악 아카이브에서 원하는 트랙을 찾아보세요
            </p>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div
              className="mb-6 p-4 rounded-2xl"
              style={{
                backgroundColor: "var(--surface-glass)",
                border: "1px solid var(--border-glass)",
              }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  활성 필터:
                </span>
                {activeFilters.map((filter, idx) => (
                  <button
                    key={`${filter.property}-${filter.value}-${idx}`}
                    onClick={() =>
                      removeFilter(
                        filter.property,
                        filter.value !== "range" ? filter.value : undefined
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))",
                      border: "1px solid rgba(102, 126, 234, 0.3)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {filter.displayValue}
                    <XMarkIcon className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="text-xs underline"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  전체 초기화
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Panel */}
            <div className="lg:w-80 flex-shrink-0">
              <div
                className="rounded-2xl p-5 sticky top-4"
                style={{
                  backgroundColor: "var(--surface-glass)",
                  border: "1px solid var(--border-glass)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <AdjustmentsHorizontalIcon
                      className="w-5 h-5"
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      필터
                    </span>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleSection("status")}
                    className="w-full flex items-center justify-between py-2 px-1"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon
                        className="w-4 h-4"
                        style={{ color: "#22c55e" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        상태 필터
                      </span>
                    </div>
                    {expandedSections.has("status") ? (
                      <ChevronUpIcon
                        className="w-4 h-4"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    ) : (
                      <ChevronDownIcon
                        className="w-4 h-4"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    )}
                  </button>

                  {expandedSections.has("status") && (
                    <div className="mt-3 space-y-2 pl-6">
                      {[
                        { value: "all", label: "전체" },
                        { value: "confirmed", label: "확정만" },
                        { value: "unconfirmed", label: "미확정만" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          onClick={() =>
                            setConfirmStatus(option.value as ConfirmStatus)
                          }
                        >
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedFilters["확정"] === option.value
                                  ? "border-[#667eea] bg-[#667eea]"
                                  : "border-gray-400 group-hover:border-[#667eea]/50"
                              }`}
                            >
                              {selectedFilters["확정"] === option.value && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  selectedFilters["확정"] === option.value
                                    ? "var(--text-primary)"
                                    : "var(--text-secondary)",
                              }}
                            >
                              {option.label}
                            </span>
                          </label>
                        </div>
                      ))}

                      <div
                        className="h-px my-3"
                        style={{
                          background:
                            "linear-gradient(to right, transparent, var(--border-glass), transparent)",
                        }}
                      />

                      {/* Drop/Rap Filters */}
                      {["Drop", "Rap"].map((filterType) => (
                        <div key={filterType} className="mb-3">
                          <label
                            className="text-xs font-medium mb-2 block"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {filterType}
                          </label>
                          <div className="flex gap-2">
                            {[
                              { value: "all", label: "전체" },
                              { value: "yes", label: "있음" },
                              { value: "no", label: "없음" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  setToggleFilter(
                                    filterType,
                                    option.value as ToggleStatus
                                  )
                                }
                                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  (selectedFilters[filterType] || "all") ===
                                  option.value
                                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                                    : ""
                                }`}
                                style={{
                                  backgroundColor:
                                    (selectedFilters[filterType] || "all") ===
                                    option.value
                                      ? undefined
                                      : "var(--bg-secondary)",
                                  border:
                                    (selectedFilters[filterType] || "all") ===
                                    option.value
                                      ? "none"
                                      : "1px solid var(--border-glass)",
                                  color:
                                    (selectedFilters[filterType] || "all") ===
                                    option.value
                                      ? "white"
                                      : "var(--text-secondary)",
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="h-px my-4"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, var(--border-glass), transparent)",
                  }}
                />

                {/* Basic Filters */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleSection("basic")}
                    className="w-full flex items-center justify-between py-2 px-1"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon
                        className="w-4 h-4"
                        style={{ color: "#f59e0b" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        기본 필터
                      </span>
                    </div>
                    {expandedSections.has("basic") ? (
                      <ChevronUpIcon
                        className="w-4 h-4"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    ) : (
                      <ChevronDownIcon
                        className="w-4 h-4"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    )}
                  </button>

                  {expandedSections.has("basic") && (
                    <div className="mt-3 space-y-4 pl-6">
                      {properties["성별"] &&
                        typeof properties["성별"] === "object" && (
                          <div>
                            <label
                              className="text-xs font-medium mb-2 block"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              성별
                            </label>
                            <select
                              value={(selectedFilters["성별"] as string) || ""}
                              onChange={(e) =>
                                setSelectFilter("성별", e.target.value || null)
                              }
                              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667eea]/50"
                              style={{
                                backgroundColor: "var(--bg-secondary)",
                                border: "1px solid var(--border-glass)",
                                color: "var(--text-primary)",
                              }}
                            >
                              <option value="">전체</option>
                              {Object.keys(properties["성별"]).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                      <div>
                        <label
                          className="text-xs font-medium mb-2 block"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          완성일 범위
                        </label>
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={dateRange.start || ""}
                            onChange={(e) =>
                              setDateRangeFilter("완성일", {
                                ...dateRange,
                                start: e.target.value || null,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667eea]/50"
                            style={{
                              backgroundColor: "var(--bg-secondary)",
                              border: "1px solid var(--border-glass)",
                              color: "var(--text-primary)",
                            }}
                          />
                          <div
                            className="text-center text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            ~
                          </div>
                          <input
                            type="date"
                            value={dateRange.end || ""}
                            onChange={(e) =>
                              setDateRangeFilter("완성일", {
                                ...dateRange,
                                end: e.target.value || null,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667eea]/50"
                            style={{
                              backgroundColor: "var(--bg-secondary)",
                              border: "1px solid var(--border-glass)",
                              color: "var(--text-primary)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="h-px my-4"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, var(--border-glass), transparent)",
                  }}
                />

                {/* Participant Filters */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleSection("participant")}
                    className="w-full flex items-center justify-between py-2 px-1"
                  >
                    <div className="flex items-center gap-2">
                      <UserGroupIcon
                        className="w-4 h-4"
                        style={{ color: "#8b5cf6" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        참여자 필터
                      </span>
                    </div>
                    {expandedSections.has("participant") ? (
                      <ChevronUpIcon
                        className="w-4 h-4"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    ) : (
                      <ChevronDownIcon
                        className="w-4 h-4"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    )}
                  </button>

                  {expandedSections.has("participant") && (
                    <div className="mt-3 space-y-4 pl-2">
                      {participantFilters.map((filterName) => {
                        const options = properties[filterName];
                        if (!options || typeof options !== "object")
                          return null;
                        const selectedValues =
                          (selectedFilters[filterName] as string[]) || [];

                        return (
                          <div key={filterName}>
                            <label
                              className="text-xs font-medium mb-2 block"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {filterName}
                            </label>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                              {Object.keys(options).map((opt) => {
                                const isSelected = selectedValues.includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    onClick={() =>
                                      toggleMultiSelectFilter(filterName, opt)
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                      isSelected
                                        ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md"
                                        : "hover:bg-white/10"
                                    }`}
                                    style={{
                                      backgroundColor: isSelected
                                        ? undefined
                                        : "var(--bg-secondary)",
                                      border: isSelected
                                        ? "none"
                                        : "1px solid var(--border-glass)",
                                      color: isSelected
                                        ? "white"
                                        : "var(--text-secondary)",
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleClear}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    필터 초기화
                  </button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="flex-1 min-w-0">
              {/* Search Bar */}
              <div className="mb-4">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: "var(--surface-glass)",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <MagnifyingGlassIcon
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="곡 제목으로 검색..."
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 rounded-lg hover:bg-white/10"
                    >
                      <XMarkIcon
                        className="w-4 h-4"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Results Header */}
              <div
                className="flex items-center justify-between p-4 rounded-t-2xl"
                style={{
                  backgroundColor: "var(--surface-glass)",
                  border: "1px solid var(--border-glass)",
                  borderBottom: "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <MusicalNoteIcon
                    className="w-5 h-5"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    결과
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "rgba(102, 126, 234, 0.2)",
                      color: "#667eea",
                    }}
                  >
                    {sortedData.length}곡
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    정렬:
                  </span>
                  <div
                    className="flex rounded-lg overflow-hidden"
                    style={{ border: "1px solid var(--border-glass)" }}
                  >
                    {[
                      { field: "date" as SortField, label: "날짜" },
                      { field: "title" as SortField, label: "제목" },
                      { field: "status" as SortField, label: "상태" },
                    ].map((item) => (
                      <button
                        key={item.field}
                        onClick={() => handleSort(item.field)}
                        className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${
                          sortField === item.field
                            ? "bg-[#667eea]/20"
                            : "hover:bg-white/5"
                        }`}
                        style={{
                          color:
                            sortField === item.field
                              ? "#667eea"
                              : "var(--text-secondary)",
                        }}
                      >
                        {item.label}
                        {sortField === item.field && (
                          <ArrowsUpDownIcon className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div
                className="rounded-b-2xl overflow-hidden"
                style={{
                  backgroundColor: "var(--surface-glass)",
                  border: "1px solid var(--border-glass)",
                  borderTop: "none",
                }}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 border-3 border-[#667eea] border-t-transparent rounded-full animate-spin mb-4" />
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      트랙을 불러오는 중...
                    </p>
                  </div>
                ) : sortedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <MagnifyingGlassIcon
                      className="w-12 h-12 mb-4"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <p
                      className="font-medium mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      결과가 없습니다
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      필터 조건을 변경해보세요
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-glass)",
                          }}
                        >
                          <th
                            className="px-4 py-3 text-left text-xs font-semibold"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            #
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-semibold"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            제목
                          </th>
                          <th
                            className="px-3 py-3 text-center text-xs font-semibold w-16"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            상태
                          </th>
                          <th
                            className="px-3 py-3 text-center text-xs font-semibold w-16"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            성별
                          </th>
                          <th
                            className="px-3 py-3 text-left text-xs font-semibold w-24"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            완성일
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-semibold"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            참여자
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((song, index) => {
                          const title =
                            song.properties.Title.title[0]?.text.content ||
                            "Untitled";
                          const isConfirmed =
                            song.properties.확정?.checkbox || false;
                          const gender =
                            song.properties.성별?.select?.name || "-";
                          const date =
                            song.properties.완성일?.date?.start || "-";
                          const songUrl = `/trackfinder?song=${encodeURIComponent(
                            title
                          )}`;

                          const participants: string[] = [];
                          if (song.properties.멜로디메이커?.multi_select.length)
                            participants.push(
                              `Ⓜ ${song.properties.멜로디메이커.multi_select
                                .map((m) => m.name)
                                .join(", ")}`
                            );
                          if (song.properties.작사?.multi_select.length)
                            participants.push(
                              `Ⓛ ${song.properties.작사.multi_select
                                .map((l) => l.name)
                                .join(", ")}`
                            );
                          if (
                            song.properties.포스트프로덕션?.multi_select.length
                          )
                            participants.push(
                              `Ⓟ ${song.properties.포스트프로덕션.multi_select
                                .map((p) => p.name)
                                .join(", ")}`
                            );

                          return (
                            <tr
                              key={index}
                              className="transition-colors duration-200 hover:bg-white/5 cursor-pointer group"
                              style={{
                                borderBottom: "1px solid var(--border-glass)",
                              }}
                              onClick={handleRowClick(song)}
                              data-href={songUrl}
                            >
                              <td className="px-4 py-3">
                                <span
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
                                  style={{
                                    backgroundColor: "var(--bg-secondary)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <Link
                                  href={songUrl}
                                  className="font-medium hover:underline"
                                  style={{ color: "var(--text-primary)" }}
                                  onClick={(e) => {
                                    if (!e.ctrlKey && !e.metaKey)
                                      e.preventDefault();
                                  }}
                                >
                                  {title}
                                </Link>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {isConfirmed ? (
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{
                                        backgroundColor:
                                          "rgba(34, 197, 94, 0.15)",
                                      }}
                                      title="확정"
                                    >
                                      <CheckCircleIcon
                                        className="w-3.5 h-3.5"
                                        style={{ color: "#22c55e" }}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{
                                        backgroundColor:
                                          "rgba(156, 163, 175, 0.15)",
                                      }}
                                      title="대기"
                                    >
                                      <ClockIcon
                                        className="w-3.5 h-3.5"
                                        style={{
                                          color: "var(--text-tertiary)",
                                        }}
                                      />
                                    </div>
                                  )}
                                  {song.properties.Drop?.checkbox && (
                                    <span
                                      className="text-[10px] font-bold px-1 rounded"
                                      style={{
                                        backgroundColor:
                                          "rgba(245, 158, 11, 0.2)",
                                        color: "#f59e0b",
                                      }}
                                      title="Drop"
                                    >
                                      D
                                    </span>
                                  )}
                                  {song.properties.Rap?.checkbox && (
                                    <span
                                      className="text-[10px] font-bold px-1 rounded"
                                      style={{
                                        backgroundColor:
                                          "rgba(239, 68, 68, 0.2)",
                                        color: "#ef4444",
                                      }}
                                      title="Rap"
                                    >
                                      R
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center mx-auto text-sm font-bold"
                                  style={{
                                    backgroundColor:
                                      gender === "남자"
                                        ? "rgba(59, 130, 246, 0.15)"
                                        : gender === "여자"
                                        ? "rgba(236, 72, 153, 0.15)"
                                        : "rgba(139, 92, 246, 0.15)",
                                    color:
                                      gender === "남자"
                                        ? "#3b82f6"
                                        : gender === "여자"
                                        ? "#ec4899"
                                        : "#8b5cf6",
                                  }}
                                  title={gender}
                                >
                                  {gender === "남자"
                                    ? "♂"
                                    : gender === "여자"
                                    ? "♀"
                                    : "⚥"}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className="text-sm whitespace-nowrap"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {date !== "-"
                                    ? date.slice(5).replace("-", ".")
                                    : "-"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {participants.slice(0, 2).map((p, i) => (
                                    <span
                                      key={i}
                                      className="text-xs px-1.5 py-0.5 rounded"
                                      style={{
                                        backgroundColor: "var(--bg-secondary)",
                                        color: "var(--text-tertiary)",
                                      }}
                                    >
                                      {p}
                                    </span>
                                  ))}
                                  {participants.length > 2 && (
                                    <span
                                      className="text-xs px-1.5 py-0.5 rounded"
                                      style={{
                                        backgroundColor: "var(--bg-secondary)",
                                        color: "var(--text-tertiary)",
                                      }}
                                    >
                                      +{participants.length - 2}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>

      {/* Modal */}
      {isMounted &&
        selectedSong &&
        createPortal(
          <div
            className="fixed inset-0 z-50 p-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
            }}
            onClick={closeSongModal}
          >
            <div
              className="w-full max-w-lg rounded-3xl p-6 relative"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-glass)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                maxHeight: "90vh",
                overflowY: "auto",
                margin: "auto 0",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeSongModal}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10"
              >
                <XMarkIcon
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>

              <h2
                className="text-2xl font-bold mb-6 pr-10"
                style={{ color: "var(--text-primary)" }}
              >
                {selectedSong.properties.Title.title[0]?.text.content ||
                  "Untitled"}
              </h2>

              {/* Audio Player */}
              {loadingLink ? (
                <div
                  className="mb-8 py-12 rounded-3xl text-center"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))",
                      }}
                    >
                      <div className="w-5 h-5 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      오디오 로딩 중...
                    </p>
                  </div>
                </div>
              ) : audioLink ? (
                <div
                  className="mb-8 rounded-3xl overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(165deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 50%, rgba(102, 126, 234, 0.05) 100%)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                    boxShadow:
                      "0 8px 32px rgba(102, 126, 234, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <audio
                    ref={audioRef}
                    src={audioLink}
                    onTimeUpdate={() =>
                      setCurrentTime(audioRef.current?.currentTime || 0)
                    }
                    onLoadedMetadata={() =>
                      setDuration(audioRef.current?.duration || 0)
                    }
                    onEnded={() => setIsPlaying(false)}
                  />

                  <div className="px-6 pt-6 pb-2">
                    <div className="flex items-end justify-center gap-[3px] h-12 opacity-60">
                      {[...Array(32)].map((_, i) => {
                        const height = Math.sin((i / 32) * Math.PI) * 100;
                        const isActive = duration
                          ? i / 32 <= currentTime / duration
                          : false;
                        return (
                          <div
                            key={i}
                            className="w-1.5 rounded-full transition-all duration-150"
                            style={{
                              height: `${20 + height * 0.8}%`,
                              background: isActive
                                ? "linear-gradient(to top, #667eea, #a855f7)"
                                : "var(--border-glass)",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="mb-6">
                      <div className="flex justify-between mb-2.5">
                        <span
                          className="text-sm font-semibold tabular-nums"
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea, #a855f7)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {formatTime(currentTime)}
                        </span>
                        <span
                          className="text-sm font-medium tabular-nums"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {formatTime(duration)}
                        </span>
                      </div>

                      <div
                        ref={progressRef}
                        className="h-2.5 rounded-full cursor-pointer relative group overflow-visible"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                        }}
                        onMouseDown={handleProgressMouseDown}
                      >
                        <div
                          className="h-full rounded-full relative transition-all overflow-visible"
                          style={{
                            width: `${
                              duration ? (currentTime / duration) * 100 : 0
                            }%`,
                            background:
                              "linear-gradient(90deg, #667eea 0%, #a855f7 50%, #ec4899 100%)",
                            boxShadow: "0 0 12px rgba(102, 126, 234, 0.5)",
                          }}
                        >
                          <div
                            className="absolute right-0 top-1/2 w-5 h-5 rounded-full transition-transform duration-150"
                            style={{
                              background:
                                "linear-gradient(135deg, #ffffff, #e0e7ff)",
                              boxShadow:
                                "0 0 0 4px rgba(102, 126, 234, 0.3), 0 2px 8px rgba(0,0,0,0.2)",
                              transform: `translate(50%, -50%) scale(${
                                isDraggingProgress ? 1.2 : 1
                              })`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 w-36">
                        <button
                          onClick={() => {
                            const newVol = volume > 0 ? 0 : 1;
                            setVolume(newVol);
                            if (audioRef.current)
                              audioRef.current.volume = newVol;
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            background:
                              volume === 0
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(102, 126, 234, 0.15)",
                          }}
                        >
                          {volume === 0 ? (
                            <SpeakerXMarkIcon
                              className="w-5 h-5"
                              style={{ color: "#ef4444" }}
                            />
                          ) : (
                            <SpeakerWaveIcon
                              className="w-5 h-5"
                              style={{ color: "#667eea" }}
                            />
                          )}
                        </button>

                        <div
                          ref={volumeRef}
                          className="flex-1 h-2 rounded-full cursor-pointer relative overflow-visible"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                          }}
                          onMouseDown={handleVolumeMouseDown}
                        >
                          <div
                            className="h-full rounded-full relative overflow-visible"
                            style={{
                              width: `${volume * 100}%`,
                              background:
                                "linear-gradient(90deg, #667eea 0%, #a855f7 100%)",
                            }}
                          >
                            <div
                              className="absolute right-0 top-1/2 w-4 h-4 rounded-full transition-transform duration-150"
                              style={{
                                background: "white",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                transform: `translate(50%, -50%) scale(${
                                  isDraggingVolume ? 1.3 : 1
                                })`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={togglePlayPause}
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%)",
                          boxShadow:
                            "0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 12px rgba(118, 75, 162, 0.3)",
                        }}
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-7 h-7 text-white" />
                        ) : (
                          <PlayIcon className="w-7 h-7 text-white ml-1" />
                        )}
                      </button>

                      <div className="w-36"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="mb-8 py-12 rounded-3xl text-center"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(100, 100, 100, 0.05), rgba(100, 100, 100, 0.02))",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(100, 100, 100, 0.1)" }}
                    >
                      <MusicalNoteIcon
                        className="w-7 h-7"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      오디오 파일이 없습니다
                    </p>
                  </div>
                </div>
              )}

              {/* Song Details */}
              <div className="space-y-3">
                <div className="flex gap-3 flex-wrap">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "var(--surface-glass)" }}
                  >
                    {selectedSong.properties.확정?.checkbox ? (
                      <>
                        <CheckCircleIcon
                          className="w-4 h-4"
                          style={{ color: "#22c55e" }}
                        />
                        <span className="text-sm" style={{ color: "#22c55e" }}>
                          확정
                        </span>
                      </>
                    ) : (
                      <>
                        <ClockIcon
                          className="w-4 h-4"
                          style={{ color: "var(--text-tertiary)" }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          대기
                        </span>
                      </>
                    )}
                  </div>
                  {selectedSong.properties.Drop?.checkbox && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#f59e0b" }}
                      >
                        Drop
                      </span>
                    </div>
                  )}
                  {selectedSong.properties.Rap?.checkbox && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#ef4444" }}
                      >
                        Rap
                      </span>
                    </div>
                  )}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "var(--surface-glass)" }}
                  >
                    <span
                      style={{
                        color:
                          selectedSong.properties.성별?.select?.name === "남자"
                            ? "#3b82f6"
                            : selectedSong.properties.성별?.select?.name ===
                              "여자"
                            ? "#ec4899"
                            : "#8b5cf6",
                      }}
                    >
                      {selectedSong.properties.성별?.select?.name === "남자"
                        ? "♂"
                        : selectedSong.properties.성별?.select?.name === "여자"
                        ? "♀"
                        : "⚥"}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {selectedSong.properties.성별?.select?.name || "-"}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "var(--surface-glass)" }}
                  >
                    <CalendarIcon
                      className="w-4 h-4"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {selectedSong.properties.완성일?.date?.start || "-"}
                    </span>
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: "var(--surface-glass)" }}
                >
                  <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    참여자
                  </h3>
                  {[
                    { key: "멜로디메이커", color: "#667eea" },
                    { key: "작사", color: "#8b5cf6" },
                    { key: "포스트프로덕션", color: "#3b82f6" },
                    { key: "스케치트랙메이커", color: "#06b6d4" },
                    { key: "마스터트랙메이커", color: "#ec4899" },
                  ].map(({ key, color }, index, array) => {
                    const prop =
                      selectedSong.properties[
                        key as keyof typeof selectedSong.properties
                      ];
                    if (
                      !prop ||
                      !("multi_select" in prop) ||
                      !prop.multi_select.length
                    )
                      return null;
                    return (
                      <div key={key}>
                        <div className="py-2.5">
                          <div
                            className="text-xs font-semibold mb-2"
                            style={{ color }}
                          >
                            {key}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {prop.multi_select.map((item: { name: string }) => (
                              <span
                                key={item.name}
                                className="text-sm px-2 py-0.5 rounded-lg"
                                style={{
                                  backgroundColor: "var(--bg-secondary)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        {index <
                          array.filter(({ key }) => {
                            const p =
                              selectedSong.properties[
                                key as keyof typeof selectedSong.properties
                              ];
                            return (
                              p && "multi_select" in p && p.multi_select.length
                            );
                          }).length -
                            1 && (
                          <div
                            className="h-px"
                            style={{
                              background:
                                "linear-gradient(to right, transparent, var(--border-glass), transparent)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
