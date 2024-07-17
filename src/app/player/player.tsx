"use client";

import { useState, useEffect, useRef } from "react";

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

  const handlePropChange = (index: number) => {
    setCurrentUrl(songs[index].url);
    setCurrentName(songs[index].name);
  };

  return (
    <div>
      <h1 className="text-center">{currentName}</h1>

      <div>
        <select
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
        {currentUrl && (
          <div>
            <audio controls src={currentUrl} autoPlay={false}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mp3Player;
