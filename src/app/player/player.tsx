"use client";

import { useState, useEffect, useRef } from "react";
import SongData from "./songData";
import { HomeIcon, HomeModernIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Mp3Link {
  name: string;
  url: string;
}

interface Mp3SelectorProps {
  songs: Mp3Link[];
}

const Mp3Player = ({ songs }: Mp3SelectorProps) => {
  const [currentName, setCurrentName] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [wrongIndex, setWrongIndex] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // const handlePropChange = (index: number) => {
  //   if (index === -1) {
  //     setWrongIndex(true);
  //     setCurrentName("");
  //   } else {
  //     setWrongIndex(false);
  //     setCurrentUrl(songs[index].url);
  //     setCurrentName(songs[index].name);
  //   }
  // };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      // audioRef.current.play();
    }
  }, [currentUrl]);
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <Link href="/">
        <HomeIcon className="h-10 w-10 text-gray-500 cursor-pointer" />
      </Link>

      <h1 className="text-center text-3xl font-bold text-gray-800 mb-4">
        {currentName ? currentName : "Select a song"}
      </h1>

      <div className="mb-4">
        <label htmlFor="mp3-select" className="sr-only">
          MP3 파일을 선택하세요:
        </label>
        <ol>
          {songs.map((link, index) => (
            <li key={index} value={link.name}>
              <Link href={`/detail/${encodeURIComponent(link.name)}`}>
                {link.name}
              </Link>
              <audio
                ref={audioRef}
                controls
                autoPlay={false}
                className="w-full"
              >
                <source src={link.url} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </li>
          ))}
        </ol>
        {/* {currentUrl && !wrongIndex && (
          <div className="mb-4">
            <audio ref={audioRef} controls autoPlay={false} className="w-full">
              <source src={currentUrl} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Mp3Player;
