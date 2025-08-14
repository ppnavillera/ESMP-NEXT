// components/AccordionItem.jsx
"use client";
import React, { useRef, useEffect, useState } from "react";

interface AccordionItemProps {
  index: number;
  title: string;
  isOpen: boolean;
  onToggle: (title: string, key: number) => void;
  onClick: (title: string) => void;
  // url: string;
  isLoading: boolean;
  children?: React.ReactNode;
  color: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  index,
  title,
  children,
  isOpen,
  onToggle,
  onClick,
  // url,
  isLoading,
  color,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");
  const [opacity, setOpacity] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isColor, setIsColor] = useState("");

  const updateHeight = () => {
    if (isOpen) {
      if (isLoading) {
        setHeight("50px"); // 로딩 중일 때 고정된 높이 설정
      } else {
        if (contentRef.current) {
          setHeight(`${contentRef.current.scrollHeight}px`);
        }
      }
      setTimeout(() => setOpacity(1), 150);
    } else {
      setHeight("0px");
      setOpacity(0);
    }
  };

  useEffect(() => {
    updateHeight();
  }, [isOpen, children]);

  return (
    <div className="border-b drop-shadow-lg">
      <div
        className="w-full flex-row justify-between items-center p-2 sm:p-4 bg-gray-100 drop-shadow-md rounded-lg"
        aria-expanded={isOpen}
      >
        <div className="p-1 w-full flex justify-between items-center sm:p-2">
          <div className="flex-grow text-center">
            <span
              className="hover:cursor-pointer text-sm sm:text-base"
              onClick={() => onClick(title)}
            >
              {title}
            </span>
            <br />
          </div>
          <span
            className={`hover:cursor-pointer transform transition-transform duration-200 ${
              isOpen ? "-rotate-90" : "rotate-0"
            }`}
            onClick={() => onToggle(title, index)}
          >
            <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              height="1em"
              role="presentation"
              viewBox="0 0 24 24"
              width="1em"
              className="text-xl"
            >
              <path
                d="M15.5 19l-7-7 7-7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              ></path>
            </svg>
          </span>
        </div>
        {/* <audio
          ref={audioRef}
          controls
          autoPlay={false}
          className=" mb-0 w-full sm:mb-2"
        >
          <source src={url} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio> */}
      </div>
      <div
        ref={contentRef}
        style={{ height }}
        className={`overflow-hidden transition-height duration-200 ease-in-out bg-gray-100`}
      >
        <div
          className={`p-4 transition-opacity duration-200 ease-in-out`}
          style={{ opacity }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
