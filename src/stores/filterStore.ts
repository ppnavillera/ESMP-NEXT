import { create } from "zustand";

// 필터 값 타입 정의
export interface FilterValue {
  [propertyName: string]: string[] | string | boolean | null;
}

// Zustand Store 인터페이스
interface FilterStore {
  selectedFilters: FilterValue;
  toggleMultiSelectFilter: (property: string, value: string) => void;
  setCheckboxFilter: (property: string, value: boolean) => void;
  setSelectFilter: (property: string, value: string | null) => void;
  setDateFilter: (property: string, value: string | null) => void;
  clearFilters: () => void;
  buildNotionFilter: () => any;
}

// Zustand Store 생성
export const useFilterStore = create<FilterStore>((set, get) => ({
  selectedFilters: {},

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

  // Checkbox 필터 설정 (확정)
  setCheckboxFilter: (property: string, value: boolean) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [property]: value,
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

  // Date 필터 설정 (완성일)
  setDateFilter: (property: string, value: string | null) => {
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [property]: value,
      },
    }));
  },

  // 모든 필터 초기화
  clearFilters: () => {
    set({ selectedFilters: {} });
  },

  // Notion API 필터 형식으로 변환
  buildNotionFilter: () => {
    const { selectedFilters } = get();
    const filters: any[] = [];

    Object.entries(selectedFilters).forEach(([property, value]) => {
      if (value === undefined || value === null) return;

      // Multi-select 필터 (멜로디메이커, 작사 등)
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => {
          filters.push({
            property,
            multi_select: {
              contains: v,
            },
          });
        });
      }
      // Checkbox 필터 (확정)
      else if (typeof value === "boolean") {
        filters.push({
          property,
          checkbox: {
            equals: value,
          },
        });
      }
      // Select 필터 (성별)
      else if (typeof value === "string") {
        // 날짜 형식 체크 (YYYY-MM-DD)
        if (property === "완성일" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          filters.push({
            property,
            date: {
              on_or_after: value,
            },
          });
        } else {
          filters.push({
            property,
            select: {
              equals: value,
            },
          });
        }
      }
    });

    // 필터가 없으면 undefined 반환
    if (filters.length === 0) return undefined;

    // 필터가 1개면 그대로 반환
    if (filters.length === 1) return filters[0];

    // 필터가 여러 개면 AND 조건으로 결합
    return {
      and: filters,
    };
  },
}));
