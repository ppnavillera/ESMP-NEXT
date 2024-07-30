import React, { useRef, useState } from "react";

const Custom = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    setDuration(audio.duration);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekTo = (audio.duration / 100) * e.target.value;
    audio.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
        >
          <source src="path/to/your-audio-file.mp3" type="audio/mp3" />
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
              onChange={handleSeek}
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
