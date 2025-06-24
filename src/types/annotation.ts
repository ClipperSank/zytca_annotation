export interface Point {
  x: number;
  y: number;
}

export type AnnotationType = 'line' | 'circle' | 'rectangle' | 'polygon';

export interface BaseAnnotation {
  id: number;
  type: AnnotationType;
  color?: string;
  strokeWidth?: number;
}

export interface LineAnnotation extends BaseAnnotation {
  type: 'line';
  startPoint: Point;
  endPoint: Point;
}

export interface CircleAnnotation extends BaseAnnotation {
  type: 'circle';
  center: Point;
  radius: number;
}

export interface RectangleAnnotation extends BaseAnnotation {
  type: 'rectangle';
  topLeft: Point;
  width: number;
  height: number;
}

export interface PolygonAnnotation extends BaseAnnotation {
  type: 'polygon';
  points: Point[];
}

export type Annotation = LineAnnotation | CircleAnnotation | RectangleAnnotation | PolygonAnnotation;

// 標註列表相關
export interface AnnotationListProps {
  annotations: Annotation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export interface AnnotationItemProps {
  annotation: Annotation;
  isSelected: boolean;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

// ViewerCanvas 相關
export interface ViewerCanvasProps {
  annotations: Annotation[];
  selectedId: number | null;
  toolMode: import('./toolbar').ToolMode;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onSelectedIdChange: (id: number | null) => void;
}