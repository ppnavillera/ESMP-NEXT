"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import Property from "./Property";
import ToggleSwitch from "./Property";

interface Song {
  properties: {
    Title: {
      title: {
        text: {
          content: string;
        };
      }[];
    };
  };
}

interface Option {
  name: string;
  color: string;
}

interface Properties {
  [key: string]: string | { [name: string]: string };
}
export default function TrackFinder() {
  const [data, setData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Properties>({});

  const fetchTracks = async () => {
    setIsLoading(true);
    const resp = await fetch("/api/notion", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const respData = await resp.json();
    setData(respData);
    setIsLoading(false);
    console.log(respData);
  };

  useEffect(() => {
    fetchProps();
    fetchTracks();
  }, []);

  const addNewProperty = (key: string, value: any) => {
    setProperties((prevState) => {
      return {
        ...prevState,
        [key]: value,
      };
    });
  };

  const fetchProps = async () => {
    const resp = await fetch("/api/properties", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const respData = await resp.json();
    // console.log(respData.properties);
    const props = respData.properties;
    for (const key of order) {
      if (key in props) {
        // console.log(props);
        if (key === "영어 제목" || key === "가이드비" || key === "Title") {
          continue;
        }

        if (props[key].type === "multi_select") {
          let values: { [name: string]: string } = {};
          const options = props[key].multi_select.options;
          options.forEach((element: Option) => {
            values[element.name] = element.color;
          });
          addNewProperty(key, values);
        } else if (props[key].type === "select") {
          let values: { [name: string]: string } = {};
          const options = props[key].select.options;
          options.forEach((element: Option) => {
            values[element.name] = element.color;
          });
          addNewProperty(key, values);
        } else {
          addNewProperty(key, props[key].type);
        }
      }
    }
  };

  const order = [
    "완성일",
    "확정",
    "Drop",
    "Rap",
    "성별",
    "인원",
    "멜로디메이커",
    "포스트프로덕션",
    "스케치트랙메이커",
    "마스터트랙메이커",
    "작사",
  ];

  // useEffect(() => {
  //   console.log(properties);
  // }, [properties]);

  return (
    <>
      {/* <select>
        <option value="a">a</option>
        <option value="b">b</option>
        <option value="c">c</option>
      </select> */}
      <nav className="h-72 rounded-3xl bg-white shadow-sm flex">
        {Object.keys(properties).map((key) => {
          const property = properties[key];
          return <Property key={key} prop={key} type={property} />;
        })}
      </nav>{" "}
      {!isLoading
        ? data.map((song, index) => {
            const title = song.properties.Title.title[0].text.content;
            return <li key={index}>{title}</li>;
          })
        : "로딩중..."}
    </>
  );
}
