import React from "react";
import useAudio from "./useAudio";

const Custom = ({ link }) => {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    formatTime,
    src,
  } = useAudio(link);

  return (
    <div className="flex items-center justify-center  bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
        >
          <source src={src} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlayPause}
            className="bg-blue-500 text-white p-2 rounded-full focus:outline-none"
          >
            {isPlaying ? "⏸️" : "▶️"}
          </button>
          <div className="flex-grow mx-4">
            <input
              type="range"
              value={(currentTime / duration) * 100 || 0}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="text-gray-700">{formatTime(currentTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default Custom;
