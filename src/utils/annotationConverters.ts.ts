import type { Annotation as NewAnnotation } from "../types/annotation";

// 舊的 Annotation 類型 (從 types/index.ts)
interface LegacyAnnotation {
  id: number;
  center: { x: number; y: number };
  radius: number;
  color?: string;
  path?: any;
}

// 將舊的圓形標註轉換為新的類型系統
export const convertLegacyToNew = (legacy: LegacyAnnotation): NewAnnotation => {
  return {
    id: legacy.id,
    type: 'circle',
    center: legacy.center,
    radius: legacy.radius,
    color: legacy.color,
  };
};

// 將新類型轉換回舊類型 (用於向後相容)
export const convertNewToLegacy = (annotation: NewAnnotation): LegacyAnnotation | null => {
  if (annotation.type !== 'circle') {
    console.warn('Cannot convert non-circle annotation to legacy format');
    return null;
  }
  
  return {
    id: annotation.id,
    center: annotation.center,
    radius: annotation.radius,
    color: annotation.color,
  };
};