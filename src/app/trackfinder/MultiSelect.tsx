"use client";

import Button from "./Button";

interface MultiSelectProps {
  property: string;
  options: any;
}

export default function MultiSelect({ property, options }: MultiSelectProps) {
  return (
    <>
      {Object.keys(options).map((key) => (
        <Button key={key} property={property} value={key} />
      ))}
    </>
  );
}
