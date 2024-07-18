"use client";

import { use, useEffect, useState } from "react";

interface SongDataProps {
  name: string;
}

export default function SongData({ name }: SongDataProps) {
  // const [trackTitle, setTrackTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const searchPayload = {
        filter: {
          property: "Title",
          title: {
            equals: name,
          },
        },
      };

      try {
        const response = await fetch("/api/notion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Something went wrong");
        }

        const data = await response.json();
        setResults(data);
        setLoading(false);
        setError(null);
      } catch (error: any) {
        setError(error.message);
        setResults(["일치하는 정보가 없습니다."]);
        setLoading(false);
      }
    };
    if (name) fetchData();
  }, [name]);

  return (
    <>
      {!loading ? (
        <ul>
          {results.map((props, index) => {
            return <li key={index}>{props}</li>;
          })}
        </ul>
      ) : (
        <h2>로딩중... </h2>
      )}
      {error && <p>Error: {error}</p>}
    </>
  );
}
