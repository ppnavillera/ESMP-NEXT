"use client";

import { useState, useEffect, useRef } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import SongData from "./songData";
import AccordionItem from "./accoItem";

interface Mp3Link {
  name: string;
  url: string;
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

const Mp3Player = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [startCursor, setStartCursor] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 15; // 한 번에 불러올 데이터 수
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({});

  const handleToggle = (index: number) => {
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

  useEffect(() => {
    console.log(songs);
  }, [songs]);

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

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <Link href="/">
        <HomeIcon className="h-10 w-10 text-gray-500 cursor-pointer" />
      </Link>

      <h1 className="text-center text-3xl font-bold text-gray-800 mb-4">
        Select a song
      </h1>

      <div className="mb-4">
        <label htmlFor="mp3-select" className="sr-only">
          MP3 파일을 선택하세요:
        </label>
        <ol>
          {songs.map((link, index) => {
            const name = link.properties.Song.title[0].text.content;
            const url = link.properties.Link.url;
            return (
              <li key={index} value={name}>
                <AccordionItem
                  key={index}
                  title={name}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                  url={url}
                  isLoading={loadingStates[index] || false} // 로딩 상태 전달
                >
                  <SongData
                    name={name}
                    onLoadingChange={(isLoading) =>
                      handleLoadingChange(index, isLoading)
                    }
                  />
                </AccordionItem>
              </li>
            );
          })}{" "}
          {loading && ( // 추가된 부분
            <li>
              <div className="skeleton-loader text-center my-5">Loading...</div>
            </li>
          )}
        </ol>
      </div>
      <div id="observer"></div>
    </div>
  );
};

export default Mp3Player;
