"use client";

import { useState } from "react";
import Button from "./Button";
import ToggleBox from "./ToggleBox";
import MultiSelect from "./MultiSelect";

interface Type {
  prop: string;
  type: any;
}

function Property({ prop, type }: Type) {
  const [sold, setSold] = useState<boolean>(true);

  return (
    <div className="flex flex-col mx-3 justify-evenly w-24 flex-none ">
      <span className="text-center ">{prop}</span>
      <div className="overflow-y-auto flex flex-col gap-2 mt-8 mb-4">
        {type === "checkbox" ? (
          <ToggleBox prop={prop} type={type} />
        ) : type === "select" ? (
          "성별"
        ) : type === "date" ? (
          "date"
        ) : (
          <MultiSelect prop={prop} type={type} />
        )}
      </div>
    </div>
  );
}

export default Property;
