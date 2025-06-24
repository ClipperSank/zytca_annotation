import type { Point } from './annotation';

/**
 * @deprecated 使用新的 Annotation 類型替代
 * 這些類型將在下個版本中移除
 */
export interface LegacyAnnotation {
  id: number;
  center: Point;
  radius: number;
  path?: any; // Paper.js path object
}

/**
 * @deprecated 使用新的 AnnotationListProps 替代
 */
export interface LegacyAnnotationListProps {
  annotations: LegacyAnnotation[];
  selectedAnnotationId: number | null;
  onSelectAnnotation: (id: number) => void;
  onDeleteAnnotation: (id: number) => void;
}

/**
 * @deprecated 使用新的 ToolBarProps 替代
 */
export interface LegacyToolBarProps {
  onClearAll: () => void;
  onExport: () => void;
  onImport: () => void;
  annotationCount: number;
  isAnnotationMode: boolean;
}

export interface ImageViewerProps {
  onAnnotationsChange: (annotations: import('./annotation').Annotation[]) => void;
  onSelectedAnnotationChange: (id: number | null) => void;
  onAnnotationModeChange?: (isAnnotationMode: boolean) => void;
}

export interface AnnotationInfoProps {
  annotation: import('./annotation').Annotation | null;
}

export interface AnnotationManagerProps {
  annotations: import('./annotation').Annotation[];
  selectedAnnotationId: number | null;
  onSelectAnnotation: (id: number) => void;
  onDeleteAnnotation: (id: number) => void;
  onClearAll: () => void;
  onImportAnnotations: (annotations: import('./annotation').Annotation[]) => void;
  isAnnotationMode: boolean;
}