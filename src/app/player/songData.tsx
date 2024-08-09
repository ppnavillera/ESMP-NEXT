// components/SongData.jsx
"use client";
import {
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
  RiCheckboxBlankLine,
  RiCheckboxFill,
} from "react-icons/ri";

interface SongDataProps {
  name: string;
  onLoadingChange: (loading: boolean) => void;
}

export default function SongData({ name, onLoadingChange }: SongDataProps) {
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [soldDate, setSoldDate] = useState<any[]>([]);

  useEffect(() => {
    console.log(soldDate);

    console.log(results);
  });

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

        const { props, dateSold } = await response.json();

        setSoldDate(dateSold);
        setResults(props);
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
        <ul className="list-disc space-y-2 text-gray-700">
          {soldDate.map((item, index) => {
            const key = Object.keys(item)[0];
            const value = item[key];

            return (
              <li
                key={index}
                className="list-disc relative flex items-center mb-2"
              >
                {key === "date" && (
                  <>
                    <CalendarIcon className="h-6 w-6 text-gray-500 mr-1" />:
                    {` ${value}`}
                  </>
                )}
                {key === "sold" && (
                  <div className="flex items-center">
                    {value ? (
                      <RiCheckboxFill className="h-6 w-6 text-green-500 p-0 m-0" />
                    ) : (
                      <RiCheckboxBlankLine className="h-6 w-6 text-gray-500 p-0 m-0" />
                    )}
                  </div>
                )}
              </li>
            );
          })}

          <br />

          {results.map((props, index) => (
            <li key={index} className="ml-5">
              {props.value}
            </li>
          ))}
        </ul>
      ) : (
        <h2>로딩중... </h2>
      )}
      {error && <p>Error: {error}</p>}
    </>
  );
}
