"use client";

import { useState, useEffect, useRef } from "react";
import { HomeIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import SongData from "./songData";
import AccordionItem from "./accoItem";
import Custom from "./cust";

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
  const [songObj, setSongObj] = useState<SongObj>();
  const [currentSong, setCurrentSong] = useState<string>();
  const [currentLink, setCurrentLink] = useState<string>();

  const setSongsObj = () => {
    songs.forEach((song) => {
      const name = song.properties.Song.title[0].text.content;
      const url = song.properties.Link.url;
      setSongObj((prevSongs) => ({
        ...prevSongs,
        [name]: url,
      }));
    });
  };

  useEffect(() => {
    setSongsObj();
  }, [songs]);

  const onClick = (title: string) => {
    setCurrentSong(title);
    if (songObj) {
      setCurrentLink(songObj[title]);
    }
  };

  useEffect(() => {
    if (audioRef.current && currentLink) {
      audioRef.current.src = currentLink;
      audioRef.current.load();
    }
    console.log(currentLink);
    playMusic();
  }, [currentLink]);

  const handleToggle = (title: string, index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    // onClick(title);
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
  };

  const pauseMusic = (): void => {
    audioRef.current?.pause();
  };

  return (
    <div className=" mx-auto bg-white p-6 rounded-lg shadow-lg max-w-screen-xl ">
      <Link href="/">
        <HomeIcon className="h-10 w-10 text-gray-500 cursor-pointer" />
      </Link>

      <h1 className="text-center text-3xl font-bold text-gray-800 mb-4">
        {currentSong ? currentSong : "Select a song"}
      </h1>
      <div className="w-full p-4 bg-blue-300 rounded-lg shadow-lg">
        <audio ref={audioRef} controls className="w-full my-3" preload="auto">
          <source src={currentLink} type="audio/mpeg" />
        </audio>
        <div className=" flex justify-center items-center gap-4">
          <button>
            <PlayIcon
              onClick={playMusic}
              className="h-10 w-10 sm:h-20 sm:w-20 text-black"
            />
          </button>
          <button>
            <PauseIcon
              onClick={pauseMusic}
              className="h-10 w-10 sm:h-20 sm:w-20 text-black"
            />
          </button>
        </div>
      </div>
      {/* <Custom link={currentLink} /> */}
      <div className="mb-4">
        <ol>
          {songs.map((link, index) => {
            const name = link.properties.Song.title[0].text.content;
            const url = link.properties.Link.url;
            // console.log(link.properties);
            return (
              <li key={index} value={name}>
                <AccordionItem
                  index={index}
                  title={name}
                  isOpen={openIndex === index}
                  onToggle={handleToggle}
                  onClick={onClick}
                  // url={url}
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
          })}
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
