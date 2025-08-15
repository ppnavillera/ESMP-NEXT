"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import Property from "./Property";
import ToggleSwitch from "./Property";
import AppLayout from "@/components/AppLayout";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
    <AppLayout title="Track Finder">
      {/* Filters Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-white/70 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex flex-wrap gap-4">
            {Object.keys(properties).map((key) => {
              const property = properties[key];
              return <Property key={key} prop={key} type={property} />;
            })}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Results</h3>
          <span className="text-sm text-white/60">
            {!isLoading ? `${data.length} tracks found` : "Loading..."}
          </span>
        </div>
        
        <div className="glass-effect rounded-2xl p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70">Loading tracks...</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scroll-container">
              {data.length > 0 ? (
                <div className="space-y-3">
                  {data.map((song, index) => {
                    const title = song.properties.Title.title[0].text.content;
                    return (
                      <div
                        key={index}
                        className="flex items-center p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#667eea]/30 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-xs font-semibold text-white mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">No tracks found</p>
                  <p className="text-white/30 text-sm">Try adjusting your filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
