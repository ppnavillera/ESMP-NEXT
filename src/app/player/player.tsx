"use client";

import { useState, useEffect, useRef } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Mp3Link {
  name: string;
  url: string;
}

interface Mp3SelectorProps {
  songs: Mp3Link[];
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
  const limit = 20; // 한 번에 불러올 데이터 수

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
                {/* <Link href={`/detail/${encodeURIComponent(name)}`}>{name}</Link> */}
                {name}
                <svg
                  data-accordion-icon
                  className="w-3 h-3 rotate-180 shrink-0"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5 5 1 1 5"
                  />
                </svg>

                <audio
                  ref={audioRef}
                  controls
                  autoPlay={false}
                  className="w-full"
                >
                  <source src={url} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
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
