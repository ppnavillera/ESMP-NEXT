"use client";

import { useEffect, useState } from "react";

export default function Test1() {
  const [songs, setSongs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [startCursor, setStartCursor] = useState(undefined);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (cursor) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/songlist?start_cursor=${cursor || ""}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const json = await response.json();
      console.log(json);

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
      fetchData(startCursor);
    }
  }, [page]);

  const handleObserver = (entries) => {
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
    <div>
      <ul>
        {songs.map((song, index) => {
          const title = song.properties.Song.title[0].text.content;
          return <li key={index}>{title}</li>;
        })}
      </ul>
      <div id="observer" style={{ height: "10px" }}></div>
    </div>
  );
}
