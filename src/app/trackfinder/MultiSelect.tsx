"use client";

import Button from "./Button";

interface Type {
  prop: string;
  type: any;
}

export default function MultiSelect({ prop, type }: Type) {
  return (
    <>
      {Object.keys(type).map((key) => (
        <Button key={key} value={key} />
      ))}
    </>
  );
}
