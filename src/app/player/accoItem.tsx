// components/AccordionItem.jsx
"use client";
import React, { useRef, useEffect, useState } from "react";

interface AccordionItemProps {
  key: number;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  url: string;
  isLoading: boolean;
  children?: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  url,
  isLoading,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");
  const [opacity, setOpacity] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // useEffect(() => {
  //   if (isOpen) {
  //     setHeight(`${contentRef.current.scrollHeight}px`);
  //     setTimeout(() => setOpacity(1), 150); // 글자가 보이기 시작하는 타이밍을 빠르게 설정
  //   } else {
  //     setHeight("0px");
  //     setOpacity(0);
  //   }
  // }, [isOpen]);

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
      <button
        className="w-full flex-row justify-between items-center p-4 bg-gray-100 drop-shadow-md rounded-lg"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="w-full flex justify-between items-center p-4">
          <div className="flex-grow text-center">
            <span>{title}</span>
          </div>
          <span
            className={`transform transition-transform duration-200 ${
              isOpen ? "-rotate-90" : "rotate-0"
            }`}
          >
            <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              height="1em"
              role="presentation"
              viewBox="0 0 24 24"
              width="1em"
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
        <audio ref={audioRef} controls autoPlay={false} className="w-full mb-2">
          <source src={url} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      </button>
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
