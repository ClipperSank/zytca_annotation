// 標註相關
export type {
  Point,
  // AnnotationType,
  // BaseAnnotation,
  // LineAnnotation,
  // CircleAnnotation,
  // RectangleAnnotation,
  // PolygonAnnotation,
  Annotation,
  // AnnotationListProps,
  // AnnotationItemProps,
  // ViewerCanvasProps,
} from './annotation';

// 工具欄相關
export type {
  ToolMode,
  ToolConfig,
  ToolBarProps,
} from './toolbar';

// UI 組件相關
export type {
  ButtonVariant,
  ButtonProps,
  ActionButtonProps,
  StatusBadgeProps,
  ToolButtonProps,
} from './ui';

// 舊版相容性 (標記為 @deprecated，計劃移除)
export type {
  LegacyAnnotation,
  LegacyAnnotationListProps,
  LegacyToolBarProps,
  AnnotationInfoProps,
  AnnotationManagerProps,
} from './legacy';
