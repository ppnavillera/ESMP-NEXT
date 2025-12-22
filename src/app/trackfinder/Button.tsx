"use client";

import { useFilterStore } from "@/stores/filterStore";

interface ButtonProps {
  property: string;
  value: string;
}

export default function Button({ property, value }: ButtonProps) {
  const { selectedFilters, toggleMultiSelectFilter } = useFilterStore();

  const isSelected = Array.isArray(selectedFilters[property])
    ? selectedFilters[property].includes(value)
    : false;

  const handleToggle = () => {
    toggleMultiSelectFilter(property, value);
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-block p-2 mb-2 w-full text-sm leading-6 font-medium text-center transition-all duration-200 rounded-xl shadow-md ${
        isSelected
          ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-lg"
          : "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700"
      } border border-transparent hover:border-[#667eea]/30`}
    >
      {value}
    </button>
  );
}
