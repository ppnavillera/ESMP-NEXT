"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "@heroicons/react/24/outline";
import { useFilterStore, ConfirmStatus, DateRange } from "@/stores/filterStore";

interface Song {
  properties: {
    Title: {
      title: {
        text: {
          content: string;
        };
      }[];
    };
    멜로디메이커?: {
      multi_select: { name: string }[];
    };
    작사?: {
      multi_select: { name: string }[];
    };
    포스트프로덕션?: {
      multi_select: { name: string }[];
    };
    스케치트랙메이커?: {
      multi_select: { name: string }[];
    };
    마스터트랙메이커?: {
      multi_select: { name: string }[];
    };
    성별?: {
      select: { name: string };
    };
    완성일?: {
      date: { start: string };
    };
    확정?: {
      checkbox: boolean;
    };
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

export default function TrackFinder() {
  const [data, setData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Properties>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["status", "basic"]));
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const {
    selectedFilters,
    buildNotionFilter,
    clearFilters,
    getActiveFilters,
    removeFilter,
    setConfirmStatus,
    setSelectFilter,
    setDateRangeFilter,
    toggleMultiSelectFilter,
  } = useFilterStore();

  const activeFilters = getActiveFilters();

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "title":
          const titleA = a.properties.Title.title[0]?.text.content || "";
          const titleB = b.properties.Title.title[0]?.text.content || "";
          comparison = titleA.localeCompare(titleB, "ko");
          break;
        case "date":
          const dateA = a.properties.완성일?.date?.start || "";
          const dateB = b.properties.완성일?.date?.start || "";
          comparison = dateA.localeCompare(dateB);
          break;
        case "status":
          const statusA = a.properties.확정?.checkbox ? 1 : 0;
          const statusB = b.properties.확정?.checkbox ? 1 : 0;
          comparison = statusA - statusB;
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder]);

  const fetchTracks = async (withFilter = false) => {
    setIsLoading(true);
    try {
      const filter = withFilter ? buildNotionFilter() : undefined;
      
      if (filter) {
        const resp = await fetch("/api/notion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filter }),
        });
        if (resp.ok) {
          const respData = await resp.json();
          setData(respData.message ? [] : [respData]);
        } else {
          setData([]);
        }
      } else {
        const resp = await fetch("/api/notion", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const respData = await resp.json();
        setData(Array.isArray(respData) ? respData : []);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProps = async () => {
    try {
      const resp = await fetch("/api/properties", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const respData = await resp.json();
      const props = respData.properties;
      const newProperties: Properties = {};
      
      const order = [
        "완성일", "확정", "Drop", "Rap", "성별", "인원",
        "멜로디메이커", "포스트프로덕션", "스케치트랙메이커", "마스터트랙메이커", "작사",
      ];

      for (const key of order) {
        if (key in props) {
          if (["영어 제목", "가이드비", "Title"].includes(key)) continue;

          if (props[key].type === "multi_select") {
            const values: { [name: string]: string } = {};
            props[key].multi_select.options.forEach((el: Option) => {
              values[el.name] = el.color;
            });
            newProperties[key] = values;
          } else if (props[key].type === "select") {
            const values: { [name: string]: string } = {};
            props[key].select.options.forEach((el: Option) => {
              values[el.name] = el.color;
            });
            newProperties[key] = values;
          } else {
            newProperties[key] = props[key].type;
          }
        }
      }
      setProperties(newProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    fetchProps();
    fetchTracks();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleSearch = () => {
    fetchTracks(true);
  };

  const handleClear = () => {
    clearFilters();
    fetchTracks(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // 참여자 필터 옵션들
  const participantFilters = ["멜로디메이커", "포스트프로덕션", "스케치트랙메이커", "마스터트랙메이커", "작사"];

  // 날짜 범위 가져오기
  const dateRange = (selectedFilters["완성일"] as DateRange) || { start: null, end: null };

  return (
    <AppLayout>
      <div className="min-h-[80vh]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Track Finder
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            ESMP 음악 아카이브에서 원하는 트랙을 찾아보세요
          </p>
        </div>

        {/* Active Filters Tags */}
        {activeFilters.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: "var(--surface-glass)", border: "1px solid var(--border-glass)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                활성 필터:
              </span>
              {activeFilters.map((filter, idx) => (
                <button
                  key={`${filter.property}-${filter.value}-${idx}`}
                  onClick={() => removeFilter(filter.property, filter.value !== "range" ? filter.value : undefined)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))",
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
                className="text-xs underline transition-colors duration-200"
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
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>필터</span>
                </div>
              </div>

              {/* Status Filter Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection("status")}
                  className="w-full flex items-center justify-between py-2 px-1"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" style={{ color: "#22c55e" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      상태 필터
                    </span>
                  </div>
                  {expandedSections.has("status") ? (
                    <ChevronUpIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  )}
                </button>
                
                {expandedSections.has("status") && (
                  <div className="mt-3 space-y-2 pl-6">
                    {[
                      { value: "all", label: "전체" },
                      { value: "confirmed", label: "확정만" },
                      { value: "unconfirmed", label: "미확정만" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
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
                          className="text-sm transition-colors duration-200"
                          style={{
                            color: selectedFilters["확정"] === option.value
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {option.label}
                        </span>
                      </label>
                    )).map((el, i) => (
                      <div
                        key={i}
                        onClick={() => setConfirmStatus(["all", "confirmed", "unconfirmed"][i] as ConfirmStatus)}
                      >
                        {el}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px my-4" style={{ background: "linear-gradient(to right, transparent, var(--border-glass), transparent)" }} />

              {/* Basic Filters Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection("basic")}
                  className="w-full flex items-center justify-between py-2 px-1"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" style={{ color: "#f59e0b" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      기본 필터
                    </span>
                  </div>
                  {expandedSections.has("basic") ? (
                    <ChevronUpIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  )}
                </button>
                
                {expandedSections.has("basic") && (
                  <div className="mt-3 space-y-4 pl-6">
                    {/* Gender Select */}
                    {properties["성별"] && typeof properties["성별"] === "object" && (
                      <div>
                        <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                          성별
                        </label>
                        <select
                          value={(selectedFilters["성별"] as string) || ""}
                          onChange={(e) => setSelectFilter("성별", e.target.value || null)}
                          className="w-full px-3 py-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#667eea]/50"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--border-glass)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <option value="">전체</option>
                          {Object.keys(properties["성별"]).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Date Range */}
                    <div>
                      <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                        완성일 범위
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={dateRange.start || ""}
                          onChange={(e) => setDateRangeFilter("완성일", { ...dateRange, start: e.target.value || null })}
                          className="w-full px-3 py-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#667eea]/50"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--border-glass)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="시작일"
                        />
                        <div className="text-center text-xs" style={{ color: "var(--text-tertiary)" }}>~</div>
                        <input
                          type="date"
                          value={dateRange.end || ""}
                          onChange={(e) => setDateRangeFilter("완성일", { ...dateRange, end: e.target.value || null })}
                          className="w-full px-3 py-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#667eea]/50"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--border-glass)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="종료일"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px my-4" style={{ background: "linear-gradient(to right, transparent, var(--border-glass), transparent)" }} />

              {/* Participant Filters Section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection("participant")}
                  className="w-full flex items-center justify-between py-2 px-1"
                >
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      참여자 필터
                    </span>
                  </div>
                  {expandedSections.has("participant") ? (
                    <ChevronUpIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  )}
                </button>
                
                {expandedSections.has("participant") && (
                  <div className="mt-3 space-y-4 pl-2">
                    {participantFilters.map((filterName) => {
                      const options = properties[filterName];
                      if (!options || typeof options !== "object") return null;

                      const selectedValues = (selectedFilters[filterName] as string[]) || [];
                      
                      return (
                        <div key={filterName}>
                          <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-tertiary)" }}>
                            {filterName}
                          </label>
                          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                            {Object.keys(options).map((opt) => {
                              const isSelected = selectedValues.includes(opt);
                              return (
                                <button
                                  key={opt}
                                  onClick={() => toggleMultiSelectFilter(filterName, opt)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                    isSelected
                                      ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md"
                                      : "hover:bg-white/10"
                                  }`}
                                  style={{
                                    backgroundColor: isSelected ? undefined : "var(--bg-secondary)",
                                    border: isSelected ? "none" : "1px solid var(--border-glass)",
                                    color: isSelected ? "white" : "var(--text-secondary)",
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

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-secondary)",
                  }}
                >
                  초기화
                </button>
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    검색
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1 min-w-0">
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
                <MusicalNoteIcon className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
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

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>정렬:</span>
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-glass)" }}>
                  {[
                    { field: "date" as SortField, label: "날짜" },
                    { field: "title" as SortField, label: "제목" },
                    { field: "status" as SortField, label: "상태" },
                  ].map((item) => (
                    <button
                      key={item.field}
                      onClick={() => handleSort(item.field)}
                      className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                        sortField === item.field ? "bg-[#667eea]/20" : "hover:bg-white/5"
                      }`}
                      style={{
                        color: sortField === item.field ? "#667eea" : "var(--text-secondary)",
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
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>트랙을 불러오는 중...</p>
                </div>
              ) : sortedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <MagnifyingGlassIcon className="w-12 h-12 mb-4" style={{ color: "var(--text-tertiary)" }} />
                  <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                    결과가 없습니다
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    필터 조건을 변경해보세요
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>제목</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>상태</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>성별</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>완성일</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>참여자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((song, index) => {
                        const title = song.properties.Title.title[0]?.text.content || "Untitled";
                        const isConfirmed = song.properties.확정?.checkbox || false;
                        const gender = song.properties.성별?.select?.name || "-";
                        const date = song.properties.완성일?.date?.start || "-";
                        
                        // 참여자 정보 축약
                        const participants: string[] = [];
                        if (song.properties.멜로디메이커?.multi_select.length) {
                          participants.push(`Ⓜ ${song.properties.멜로디메이커.multi_select.map(m => m.name).join(", ")}`);
                        }
                        if (song.properties.작사?.multi_select.length) {
                          participants.push(`Ⓛ ${song.properties.작사.multi_select.map(l => l.name).join(", ")}`);
                        }
                        if (song.properties.포스트프로덕션?.multi_select.length) {
                          participants.push(`Ⓟ ${song.properties.포스트프로덕션.multi_select.map(p => p.name).join(", ")}`);
                        }

                        return (
                          <tr
                            key={index}
                            className="transition-colors duration-200 hover:bg-white/5 cursor-pointer"
                            style={{ borderBottom: "1px solid var(--border-glass)" }}
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
                              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                                {title}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isConfirmed ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}
                                >
                                  <CheckCircleIcon className="w-3.5 h-3.5" />
                                  확정
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: "rgba(156, 163, 175, 0.15)", color: "var(--text-tertiary)" }}
                                >
                                  <ClockIcon className="w-3.5 h-3.5" />
                                  대기
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className="px-2 py-1 rounded-lg text-xs font-medium"
                                style={{
                                  backgroundColor: "var(--bg-secondary)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {gender}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                {date}
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
  );
}
