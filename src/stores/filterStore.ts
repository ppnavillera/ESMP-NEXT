import { create } from "zustand";

// 확정 필터 상태 타입 (전체/확정만/미확정만)
export type ConfirmStatus = "all" | "confirmed" | "unconfirmed";

// Drop/Rap 필터 상태 타입
export type ToggleStatus = "all" | "yes" | "no";

// 날짜 범위 타입
export interface DateRange {
  start: string | null;
  end: string | null;
}

// 필터 값 타입 정의
export interface FilterValue {
  [propertyName: string]: string[] | string | boolean | null | ConfirmStatus | ToggleStatus | DateRange | undefined;
}

// Zustand Store 인터페이스
interface FilterStore {
  selectedFilters: FilterValue;
  toggleMultiSelectFilter: (property: string, value: string) => void;
  setConfirmStatus: (status: ConfirmStatus) => void;
  setToggleFilter: (property: string, status: ToggleStatus) => void;
  setSelectFilter: (property: string, value: string | null) => void;
  setDateRangeFilter: (property: string, range: DateRange) => void;
  removeFilter: (property: string, value?: string) => void;
  clearFilters: () => void;
  buildNotionFilter: () => any;
  getActiveFilters: () => { property: string; value: string; displayValue: string }[];
}

// Zustand Store 생성
export const useFilterStore = create<FilterStore>((set, get) => ({
  selectedFilters: {
    확정: "all" as ConfirmStatus, // 기본값: 전체
    Drop: "all" as ToggleStatus,
    Rap: "all" as ToggleStatus,
  },

  // Multi-select 필터 토글 (멜로디메이커, 작사 등)
  toggleMultiSelectFilter: (property: string, value: string) => {
    set((state) => {
      const currentValues = (state.selectedFilters[property] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        selectedFilters: {
          ...state.selectedFilters,
          [property]: newValues.length > 0 ? newValues : undefined,
        },
      };
    });
  },

  // 확정 상태 설정 (전체/확정만/미확정만)
  setConfirmStatus: (status: ConfirmStatus) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        확정: status,
      },
    }));
  },

  // Drop/Rap 상태 설정
  setToggleFilter: (property: string, status: ToggleStatus) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [property]: status,
      },
    }));
  },

  // Select 필터 설정 (성별)
  setSelectFilter: (property: string, value: string | null) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [property]: value,
      },
    }));
  },

  // 날짜 범위 필터 설정
  setDateRangeFilter: (property: string, range: DateRange) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [property]: range.start || range.end ? range : undefined,
      },
    }));
  },

  // 특정 필터 제거
  removeFilter: (property: string, value?: string) => {
    set((state) => {
      const newFilters = { ...state.selectedFilters };

      if (property === "확정") {
        newFilters["확정"] = "all";
      } else if (property === "Drop" || property === "Rap") {
        newFilters[property] = "all";
      } else if (value && Array.isArray(newFilters[property])) {
        const arr = newFilters[property] as string[];
        const filtered = arr.filter((v) => v !== value);
        newFilters[property] = filtered.length > 0 ? filtered : undefined;
      } else {
        newFilters[property] = undefined;
      }

      return { selectedFilters: newFilters };
    });
  },

  // 모든 필터 초기화
  clearFilters: () => {
    set({ selectedFilters: { 확정: "all", Drop: "all", Rap: "all" } });
  },

  // 활성 필터 목록 가져오기 (태그 표시용)
  getActiveFilters: () => {
    const { selectedFilters } = get();
    const active: { property: string; value: string; displayValue: string }[] = [];

    Object.entries(selectedFilters).forEach(([property, value]) => {
      if (value === undefined || value === null) return;

      if (property === "확정") {
        if (value === "confirmed") {
          active.push({ property, value: "confirmed", displayValue: "확정만" });
        } else if (value === "unconfirmed") {
          active.push({ property, value: "unconfirmed", displayValue: "미확정만" });
        }
        // "all"일 때는 태그 표시 안 함
      } else if (property === "Drop" || property === "Rap") {
        if (value === "yes") {
          active.push({ property, value: "yes", displayValue: `${property} 있음` });
        } else if (value === "no") {
          active.push({ property, value: "no", displayValue: `${property} 없음` });
        }
        // "all"일 때는 태그 표시 안 함
      } else if (Array.isArray(value)) {
        value.forEach((v) => {
          active.push({ property, value: v, displayValue: `${property}: ${v}` });
        });
      } else if (typeof value === "object" && "start" in value) {
        // DateRange
        const range = value as DateRange;
        if (range.start && range.end) {
          active.push({ property, value: "range", displayValue: `${property}: ${range.start} ~ ${range.end}` });
        } else if (range.start) {
          active.push({ property, value: "range", displayValue: `${property}: ${range.start} 이후` });
        } else if (range.end) {
          active.push({ property, value: "range", displayValue: `${property}: ${range.end} 이전` });
        }
      } else if (typeof value === "string") {
        active.push({ property, value, displayValue: `${property}: ${value}` });
      }
    });

    return active;
  },

  // Notion API 필터 형식으로 변환
  buildNotionFilter: () => {
    const { selectedFilters } = get();
    const filters: any[] = [];

    Object.entries(selectedFilters).forEach(([property, value]) => {
      if (value === undefined || value === null) return;

      // 확정 상태 필터
      if (property === "확정") {
        if (value === "confirmed") {
          filters.push({ property, checkbox: { equals: true } });
        } else if (value === "unconfirmed") {
          filters.push({ property, checkbox: { equals: false } });
        }
        // "all"일 때는 필터 추가 안 함
      }
      // Drop/Rap 필터
      else if (property === "Drop" || property === "Rap") {
        if (value === "yes") {
          filters.push({ property, checkbox: { equals: true } });
        } else if (value === "no") {
          filters.push({ property, checkbox: { equals: false } });
        }
        // "all"일 때는 필터 추가 안 함
      }
      // Multi-select 필터 (멜로디메이커, 작사 등)
      else if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => {
          filters.push({
            property,
            multi_select: { contains: v },
          });
        });
      }
      // 날짜 범위 필터
      else if (typeof value === "object" && "start" in value) {
        const range = value as DateRange;
        if (range.start) {
          filters.push({
            property,
            date: { on_or_after: range.start },
          });
        }
        if (range.end) {
          filters.push({
            property,
            date: { on_or_before: range.end },
          });
        }
      }
      // Select 필터 (성별)
      else if (typeof value === "string") {
        filters.push({
          property,
          select: { equals: value },
        });
      }
    });

    // 필터가 없으면 undefined 반환
    if (filters.length === 0) return undefined;

    // 필터가 1개면 그대로 반환
    if (filters.length === 1) return filters[0];

    // 필터가 여러 개면 AND 조건으로 결합
    return { and: filters };
  },
}));
