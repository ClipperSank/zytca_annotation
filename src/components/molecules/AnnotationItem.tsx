// import React from 'react';
// import Button from '../atoms/Button';
// import type { Annotation } from '../../types';

// interface AnnotationItemProps {
//   annotation: Annotation;
//   isSelected: boolean;
//   onSelect: (id: number) => void;
//   onDelete: (id: number) => void;
// }

// const AnnotationItem: React.FC<AnnotationItemProps> = ({ 
//   annotation, 
//   isSelected, 
//   onSelect, 
//   onDelete 
// }) => (
//   <li className="my-2 flex items-center gap-2">
//     <Button
//       onClick={() => onSelect(annotation.id)}
//       variant={isSelected ? 'selected' : 'primary'}
//     >
//       Circle {annotation.id}
//     </Button>
//     <Button onClick={() => onDelete(annotation.id)} variant="danger">
//       Delete
//     </Button>
//   </li>
// );

// export default AnnotationItem;
import React from 'react';
import { IconEye, IconMinus, IconCircle, IconSquare, IconPolygon } from '@tabler/icons-react';
import StatusBadge from '../atoms/StatusBadge';
import ActionButton from '../atoms/ActionButton';
import type { AnnotationItemProps } from '../../types';

const AnnotationItem: React.FC<AnnotationItemProps> = ({
  annotation,
  isSelected,
  onDelete,
  onView
}) => {
  const getTypeIcon = () => {
    switch (annotation.type) {
      case 'line':
        return <IconMinus size={16} />;
      case 'circle':
        return <IconCircle size={16} />;
      case 'rectangle':
        return <IconSquare size={16} />;
      case 'polygon':
        return <IconPolygon size={16} />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (annotation.type) {
      case 'line':
        return '線條';
      case 'circle':
        return '圓形';
      case 'rectangle':
        return '正方形';
      case 'polygon':
        return '多邊形';
      default:
        // 修復：使用 satisfies 確保類型安全
        return (annotation as { type: string }).type;
    }
  };

  return (
    <div
      className={`grid grid-cols-12 gap-2 items-center px-2 py-2 rounded border shadow-sm ${
        isSelected ? 'border-green-400' : 'border-gray-200'
      }`}
    >
      {/* ID & Type */}
      <div className="col-span-3 flex items-center gap-1 text-sm">
        {getTypeIcon()}
        <span>{annotation.id}</span>
      </div>
      
      {/* Type Label */}
      <div className="col-span-3 text-xs text-gray-600">
        {getTypeLabel()}
      </div>
      
      {/* Status */}
      <div className="col-span-2">
        <StatusBadge isActive={isSelected} />
      </div>
      
      {/* Delete */}
      <div className="col-span-2 flex justify-center">
        <ActionButton
          variant="delete"
          onClick={() => onDelete(annotation.id)}
        >
          Delete
        </ActionButton>
      </div>
      
      {/* View */}
      <div className="col-span-2 flex justify-center">
        <ActionButton
          variant="view"
          onClick={() => onView(annotation.id)}
          title="View Details"
        >
          <IconEye size={18} />
        </ActionButton>
      </div>
    </div>
  );
};

export default AnnotationItem;