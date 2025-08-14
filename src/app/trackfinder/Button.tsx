"use client";

import { useEffect, useState } from "react";

interface Property {
  value: any;
}
export default function Button({ value }: Property) {
  const [toggle, setToggle] = useState(false);
  useEffect(() => {
    setToggle(false);
  }, []);

  const onToggle = () => {
    if (!toggle) {
      setToggle(true);
    } else {
      setToggle(false);
    }
  };

  return (
    <>
      <button
        onClick={onToggle}
        className={`inline-block p-2 mb-2 md:mb-0 w-full md:w-full text-base leading-6 font-medium text-center ${
          toggle
            ? "bg-green-400 text-white hover:bg-green-600"
            : "shadow-inner bg-green-700 text-gray-300 hover:bg-green-6000"
        } border border-transparent hover:border-gray-200 rounded-xl shadow-md`}
      >
        {/* {!toggle ? "ON" : "OFF"} */}
        {value}
      </button>
      {/* <button className="inline-block py-4 px-6 w-full md:w-auto text-lg leading-6 font-medium text-center text-gray-500 bg-white border border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 rounded-md shadow-sm">
        hi
      </button> */}
    </>
  );
}

// focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
