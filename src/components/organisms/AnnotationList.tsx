import React from 'react';
import AnnotationListHeader from '../molecules/AnnotationListHeader';
import AnnotationItem from '../molecules/AnnotationItem';
import type { AnnotationListProps } from '../../types';

const AnnotationList: React.FC<AnnotationListProps> = ({
  annotations,
  selectedId,
  onSelect,
  onDelete,
  onView,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 overflow-y-auto max-h-[80vh]">
      <h2 className="text-xl font-bold mb-4">Annotations</h2>
      
      <AnnotationListHeader />
      
      <div className="space-y-2">
        {annotations.map((annotation) => (
          <AnnotationItem
            key={annotation.id}
            annotation={annotation}
            isSelected={selectedId === annotation.id}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnotationList;