"use client";

import { useFilterStore } from "@/stores/filterStore";

interface ToggleBoxProps {
  property: string;
}

export default function ToggleBox({ property }: ToggleBoxProps) {
  const { selectedFilters, setCheckboxFilter } = useFilterStore();

  const isToggled = selectedFilters[property] === true;

  const handleToggle = () => {
    setCheckboxFilter(property, !isToggled);
  };

  return (
    <div className="flex items-center justify-center">
      <div
        onClick={handleToggle}
        className={`cursor-pointer w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isToggled
            ? "bg-gradient-to-r from-[#667eea] to-[#764ba2]"
            : "bg-gray-600"
        }`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${
            isToggled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
      <span className="ml-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {isToggled ? "ON" : "OFF"}
      </span>
    </div>
  );
}
