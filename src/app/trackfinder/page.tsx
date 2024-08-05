"use client";

import { useEffect, useState } from "react";

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
export default function TrackFinder() {
  const [data, setData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState({});

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
    // console.log(respData);
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

  interface Option {
    name: string;
    color: string;
  }

  interface Properties {
    [key: string]: string | { [name: string]: string };
  }
  const fetchProps = async () => {
    const resp = await fetch("/api/properties", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const respData = await resp.json();
    console.log(respData.properties);
    const props = respData.properties;
    for (const key in props) {
      //   console.log(key);
      if (props[key].type === "multi_select") {
        let values: { [name: string]: string } = {};
        const options = props[key].multi_select.options;
        options.forEach((element: Option) => {
          values[element.name] = element.color;
        });
        // console.log(props[key].multi_select.options);
        // console.log(values);
        addNewProperty(key, values);
      } else {
        addNewProperty(key, props[key].type);
      }
    }
    // console.log(properties);
  };

  useEffect(() => {
    console.log(properties);
  }, [properties]);

  return (
    // <select>
    //     {data.map((item, index) => (
    //         <option key={index}>{item}</option>
    // </select>
    <ol>
      {!isLoading
        ? data.map((song, index) => {
            const title = song.properties.Title.title[0].text.content;
            return <li key={index}>{title}</li>;
          })
        : "로딩중..."}
    </ol>
  );
}
