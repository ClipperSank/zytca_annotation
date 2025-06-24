import React from 'react';

const AnnotationListHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-2 px-2 mb-2 text-sm font-semibold text-gray-600">
      <div className="col-span-3">ID</div>
      <div className="col-span-3">類型</div>
      <div className="col-span-2">狀態</div>
      <div className="col-span-2 text-center">刪除</div>
      <div className="col-span-2 text-center">檢視</div>
    </div>
  );
};

export default AnnotationListHeader;
