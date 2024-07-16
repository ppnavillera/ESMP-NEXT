"use client";

import { useState, useEffect } from "react";
import supabase from "./supabaseClient";

interface Mp3Link {
  name: string;
  url: string;
}

const Mp3Player = () => {
  const [mp3Links, setMp3Links] = useState<Mp3Link[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [playing, setPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMp3Links();
  }, []);

  useEffect(() => {
    console.log(mp3Links);
  }, [mp3Links]);

  const fetchMp3Links = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("esmp", {
        body: {},
      });
      if (error) {
        console.error("Error invoking function:", error);
      } else {
        // console.log("Function response data:", data);
        // 여기서 data를 원하는 대로 처리할 수 있습니다.
        const songs = data.results.map(
          (page: {
            properties: {
              Link: { url: string };
              Song: { title: { text: { content: string } }[] };
            };
          }) => {
            return {
              name: page.properties.Song.title[0].text.content,
              url: page.properties.Link.url,
            };
          }
        );
        setMp3Links(songs);
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleUrlChange = (url: string) => {
    setCurrentUrl(url);
    setPlaying(false);
  };

  return (
    <div>
      <h1>MP3 플레이어</h1>
      {!loading ? (
        <div>
          <select onChange={(e) => handleUrlChange(e.target.value)}>
            <option value="">MP3 파일을 선택하세요</option>
            {mp3Links.map((link, index) => (
              <option key={index} value={link.url}>
                {link.name}
              </option>
            ))}
          </select>
          {currentUrl && (
            <div>
              <audio controls src={currentUrl} autoPlay={playing}>
                Your browser does not support the audio element.
              </audio>
              <button onClick={handlePlay}>재생</button>
              <button onClick={handlePause}>일시정지</button>
            </div>
          )}
        </div>
      ) : (
        <p>데이터를 불러오는 중...</p>
      )}
    </div>
  );
};

export default Mp3Player;
