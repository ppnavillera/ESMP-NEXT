// components/SongData.jsx
"use client";
import { useEffect, useState } from "react";

interface SongDataProps {
  name: string;
  onLoadingChange: (loading: boolean) => void;
}

export default function SongData({ name, onLoadingChange }: SongDataProps) {
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);
      onLoadingChange(true); // 로딩 상태 변경을 부모 컴포넌트에 알림

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
        onLoadingChange(false); // 로딩 완료를 부모 컴포넌트에 알림
      } catch (error: any) {
        setError(error.message);
        setResults(["일치하는 정보가 없습니다."]);
        setLoading(false);
        onLoadingChange(false); // 로딩 완료를 부모 컴포넌트에 알림
      }
    };

    if (name) {
      fetchData();
    }
  }, [name]); // 종속성 배열에 onLoadingChange를 제외

  return (
    <>
      {!loading ? (
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {results.map((props, index) => (
            <li key={index}>{props}</li>
          ))}
        </ul>
      ) : (
        <h2>로딩중... </h2>
      )}
      {error && <p>Error: {error}</p>}
    </>
  );
}
