"use client";

import { useEffect, useState } from "react";
import Property from "./Property";
import AppLayout from "@/components/AppLayout";
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useFilterStore } from "@/stores/filterStore";

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
    성별?: {
      select: { name: string };
    };
    완성일?: {
      date: { start: string };
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

export default function TrackFinder() {
  const [data, setData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Properties>({});

  const { buildNotionFilter, clearFilters, selectedFilters } = useFilterStore();

  const fetchTracks = async (withFilter = false) => {
    setIsLoading(true);
    try {
      if (withFilter) {
        const filter = buildNotionFilter();
        const resp = await fetch("/api/notion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filter }),
        });

        if (resp.ok) {
          const respData = await resp.json();
          // POST endpoint returns single song, wrap in array for consistency
          setData(respData.message ? [] : [respData]);
        } else {
          setData([]);
        }
      } else {
        const resp = await fetch("/api/notion", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const respData = await resp.json();
        setData(respData);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProps();
    fetchTracks();
  }, []);

  const addNewProperty = (key: string, value: any) => {
    setProperties((prevState) => {
      return {
        ...prevState,
        [key]: value,
      };
    });
  };

  const fetchProps = async () => {
    const resp = await fetch("/api/properties", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const respData = await resp.json();
    const props = respData.properties;
    for (const key of order) {
      if (key in props) {
        if (key === "영어 제목" || key === "가이드비" || key === "Title") {
          continue;
        }

        if (props[key].type === "multi_select") {
          let values: { [name: string]: string } = {};
          const options = props[key].multi_select.options;
          options.forEach((element: Option) => {
            values[element.name] = element.color;
          });
          addNewProperty(key, values);
        } else if (props[key].type === "select") {
          let values: { [name: string]: string } = {};
          const options = props[key].select.options;
          options.forEach((element: Option) => {
            values[element.name] = element.color;
          });
          addNewProperty(key, values);
        } else {
          addNewProperty(key, props[key].type);
        }
      }
    }
  };

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

  const handleApplyFilters = () => {
    fetchTracks(true);
  };

  const handleClearFilters = () => {
    clearFilters();
    fetchTracks(false);
  };

  const getFilterCount = () => {
    return Object.values(selectedFilters).filter(
      (value) => value !== undefined && value !== null &&
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <AppLayout title="Track Finder">
      {/* Filters Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h3>
            {getFilterCount() > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                {getFilterCount()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700"
            >
              <XMarkIcon className="w-4 h-4" />
              초기화
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-lg"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              검색
            </button>
          </div>
        </div>
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex flex-wrap gap-4">
            {Object.keys(properties).map((key) => {
              const property = properties[key];
              return <Property key={key} property={key} type={property} />;
            })}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Results</h3>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {!isLoading ? `${data.length} tracks found` : "Loading..."}
          </span>
        </div>

        <div className="glass-effect rounded-2xl p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading tracks...</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scroll-container">
              {data.length > 0 ? (
                <div className="space-y-3">
                  {data.map((song, index) => {
                    const title = song.properties.Title.title[0]?.text.content || "Untitled";
                    const melody = song.properties.멜로디메이커?.multi_select.map(m => m.name).join(", ") || "-";
                    const lyrics = song.properties.작사?.multi_select.map(l => l.name).join(", ") || "-";
                    const production = song.properties.포스트프로덕션?.multi_select.map(p => p.name).join(", ") || "-";
                    const gender = song.properties.성별?.select?.name || "-";
                    const date = song.properties.완성일?.date?.start || "-";

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-xl transition-all duration-300 hover:border-[#667eea]/50 cursor-pointer border"
                        style={{
                          backgroundColor: 'var(--surface-glass)',
                          borderColor: 'var(--border-glass)',
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                              {title}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex gap-1">
                                <span style={{ color: 'var(--text-tertiary)' }}>멜로디:</span>
                                <span style={{ color: 'var(--text-secondary)' }} className="truncate">{melody}</span>
                              </div>
                              <div className="flex gap-1">
                                <span style={{ color: 'var(--text-tertiary)' }}>작사:</span>
                                <span style={{ color: 'var(--text-secondary)' }} className="truncate">{lyrics}</span>
                              </div>
                              <div className="flex gap-1">
                                <span style={{ color: 'var(--text-tertiary)' }}>포스트:</span>
                                <span style={{ color: 'var(--text-secondary)' }} className="truncate">{production}</span>
                              </div>
                              <div className="flex gap-1">
                                <span style={{ color: 'var(--text-tertiary)' }}>성별:</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{gender}</span>
                              </div>
                              <div className="flex gap-1 col-span-2">
                                <span style={{ color: 'var(--text-tertiary)' }}>완성일:</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No tracks found</p>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Try adjusting your filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
