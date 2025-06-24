import React from 'react';
import { 
  IconMinus, 
  IconCircle, 
  IconSquare, 
  IconPolygon, 
  IconEraser 
} from '@tabler/icons-react';
import ToolButton from '../atoms/ToolButton';
import type { ToolBarProps, ToolConfig, ToolMode } from '../../types';

const ToolBar: React.FC<ToolBarProps> = ({ currentMode, onChangeMode }) => {
  const tools: ToolConfig[] = [
    {
      mode: 'line',
      icon: <IconMinus size={20} />,
      tooltip: '畫線'
    },
    {
      mode: 'circle',
      icon: <IconCircle size={20} />,
      tooltip: '畫圓'
    },
    {
      mode: 'rectangle',
      icon: <IconSquare size={20} />,
      tooltip: '畫正方形'
    },
    {
      mode: 'polygon',
      icon: <IconPolygon size={20} />,
      tooltip: '畫多邊形'
    },
    {
      mode: 'eraser',
      icon: <IconEraser size={20} />,
      tooltip: '刪除 (橡皮擦)'
    }
  ];

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2">
      {tools.map(({ mode, icon, tooltip }) => (
        <ToolButton
          key={mode}
          isActive={currentMode === mode}
          icon={icon}
          tooltip={tooltip}
          onClick={() => onChangeMode(mode)}
        />
      ))}
    </div>
  );
};

export default ToolBar;
