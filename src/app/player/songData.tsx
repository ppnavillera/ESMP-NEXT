"use client";
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface SongDataProps {
  name: string;
  onLoadingChange: (loading: boolean) => void;
  onColorChange?: Dispatch<SetStateAction<string>>;
}

export default function SongData({
  name,
  onLoadingChange,
  onColorChange,
}: SongDataProps) {
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [soldDate, setSoldDate] = useState<any[]>([]);

  useEffect(() => {
    if (!name) return;
    
    setError(null);
    setLoading(true);
    onLoadingChange(true);

    const fetchData = async () => {
      const searchPayload = {
        filter: {
          property: "Title",
          title: {
            equals: name,
          },
        },
      };

      try {
        const response = await fetch("/api/notion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Something went wrong");
        }

        const { props, dateSold } = await response.json();
        setSoldDate(dateSold);
        setResults(props);
        setLoading(false);
        onLoadingChange(false);
      } catch (error: any) {
        setError(error.message);
        setResults([]);
        setLoading(false);
        onLoadingChange(false);
      }
    };

    fetchData();
  }, [name]); // onLoadingChange를 의존성에서 제거

  if (loading) {
    return (
      <div className="space-y-3">
        {/* Loading skeleton */}
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--surface-glass)' }} />
            <div className="h-4 rounded-md w-32 animate-pulse" style={{ backgroundColor: 'var(--surface-glass)' }} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--surface-glass)' }} />
            <div className="h-4 rounded-md w-24 animate-pulse" style={{ backgroundColor: 'var(--surface-glass)' }} />
          </div>
          <div className="ml-11 space-y-2">
            <div className="h-3 rounded w-3/4 animate-pulse" style={{ backgroundColor: 'var(--surface-glass)' }} />
            <div className="h-3 rounded w-1/2 animate-pulse" style={{ backgroundColor: 'var(--surface-glass)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <XCircleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-medium text-sm">Error occurred</p>
            <p className="text-red-200/70 text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0 && soldDate.length === 0) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <InformationCircleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-300 font-medium text-sm">No data found</p>
            <p className="text-yellow-200/70 text-xs mt-1">
              일치하는 정보가 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date and Sold Status Section */}
      {soldDate.length > 0 && (
        <div className="space-y-3">
          {soldDate.map((item, index) => {
            const key = Object.keys(item)[0];
            const value = item[key];

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
                style={{
                  backgroundColor: 'var(--surface-glass)',
                  borderColor: 'var(--border-glass)',
                }}
              >
                {key === "date" && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                        Release Date
                      </p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    </div>
                  </>
                )}

                {key === "sold" && (
                  <>
                    <div
                      className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${
                        value
                          ? "bg-gradient-to-br from-green-500/20 to-green-700/20"
                          : "bg-gradient-to-br from-gray-500/20 to-gray-700/20"
                      }
                    `}
                    >
                      {value ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                        Status
                      </p>
                      <p
                        className="font-medium"
                        style={{
                          color: value ? '#4ade80' : 'var(--text-tertiary)',
                        }}
                      >
                        {value ? "Sold" : "Available"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Separator */}
      {soldDate.length > 0 && results.length > 0 && (
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}

      {/* Additional Properties Section */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <MusicalNoteIcon className="w-4 h-4 text-purple-400" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Track Details</p>
          </div>

          <div className="pl-6 space-y-2">
            {results.map((props, index) => {
              if (props.key === "성별") return null;

              return (
                <div key={index} className="flex items-start gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mt-1.5 group-hover:bg-purple-400 transition-colors duration-200" />
                  <p className="text-sm leading-relaxed transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}>
                    {props.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
