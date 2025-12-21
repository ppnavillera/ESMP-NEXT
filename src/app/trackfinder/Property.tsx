"use client";

import ToggleBox from "./ToggleBox";
import MultiSelect from "./MultiSelect";
import { useFilterStore } from "@/stores/filterStore";

interface PropertyProps {
  property: string;
  type: any;
}

function Property({ property, type }: PropertyProps) {
  const { selectedFilters, setSelectFilter, setDateFilter } = useFilterStore();

  // Checkbox 타입
  if (type === "checkbox") {
    return (
      <div className="flex flex-col items-center min-w-[120px] flex-none">
        <span className="text-center text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {property}
        </span>
        <div className="mt-2">
          <ToggleBox property={property} />
        </div>
      </div>
    );
  }

  // Select 타입 (성별)
  if (type === "select" || (typeof type === "object" && !Array.isArray(type) && property === "성별")) {
    const options = typeof type === "object" ? Object.keys(type) : [];
    return (
      <div className="flex flex-col items-center min-w-[120px] flex-none">
        <span className="text-center text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {property}
        </span>
        <div className="mt-2 w-full">
          <select
            value={selectedFilters[property] as string || ""}
            onChange={(e) => setSelectFilter(property, e.target.value || null)}
            className="w-full p-2 text-sm rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 border border-transparent focus:border-[#667eea]/50 focus:outline-none"
          >
            <option value="">전체</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // Date 타입 (완성일)
  if (type === "date") {
    return (
      <div className="flex flex-col items-center min-w-[140px] flex-none">
        <span className="text-center text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {property}
        </span>
        <div className="mt-2 w-full">
          <input
            type="date"
            value={selectedFilters[property] as string || ""}
            onChange={(e) => setDateFilter(property, e.target.value || null)}
            className="w-full p-2 text-sm rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 border border-transparent focus:border-[#667eea]/50 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // Multi-select 타입 (멜로디메이커, 작사 등)
  return (
    <div className="flex flex-col mx-3 min-w-[120px] flex-none">
      <span className="text-center text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        {property}
      </span>
      <div className="overflow-y-auto flex flex-col gap-2 mt-2 max-h-48 scroll-container">
        <MultiSelect property={property} options={type} />
      </div>
    </div>
  );
}

export default Property;
