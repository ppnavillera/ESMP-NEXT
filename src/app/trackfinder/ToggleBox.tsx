"use client";
import { useState } from "react";

interface Value {
  prop: string;
  type: any;
}
export default function ToggleBox({ prop, type }: Value) {
  const [isToggled, setIsToggled] = useState(false);
  // const [, setValue] = useState(null);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <>
      <div className="flex items-center border border-red-100 mb-10">
        <div
          onClick={handleToggle}
          className={`cursor-pointer w-14 h-8 flex items-center rounded-full p-1
          ${
            isToggled
              ? "bg-green-500"
              : `${prop === "성별" ? "bg-red-500" : "bg-gray-300"}`
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300
            ${isToggled ? "translate-x-6" : "translate-x-0"}`}
          />
        </div>
        <span className="ml-2 text-lg w-8 text-center">
          {prop === "성별" ? (isToggled ? "남" : "여") : isToggled ? "O" : "X"}
        </span>
      </div>
    </>
  );
}
