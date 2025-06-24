export type ToolMode = 'line' | 'circle' | 'rectangle' | 'polygon' | 'eraser';

export interface ToolConfig {
  mode: ToolMode;
  icon: React.ReactNode;
  tooltip: string;
}

export interface ToolBarProps {
  currentMode: ToolMode;
  onChangeMode: (mode: ToolMode) => void;
}