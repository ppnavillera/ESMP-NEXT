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

  const handlePropChange = (index: number) => {
    if (index === -1) {
      setWrongIndex(true);
      setCurrentName("");
    } else {
      setWrongIndex(false);
      setCurrentUrl(songs[index].url);
      setCurrentName(songs[index].name);
    }
  };

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
        <select
          id="mp3-select"
          className="block w-full bg-gray-100 border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          onChange={(e) => {
            handlePropChange(e.target.selectedIndex - 1);
          }}
        >
          <option value="">MP3 파일을 선택하세요</option>
          {songs.map((link, index) => (
            <option key={index} value={link.name}>
              {link.name}
            </option>
          ))}
        </select>
        {currentUrl && !wrongIndex && (
          <div className="mb-4">
            <audio controls autoPlay={false} className="w-full">
              <source src={currentUrl} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        {currentName ? <SongData name={currentName} /> : null}
      </div>
    </div>
  );
};

export default Mp3Player;
