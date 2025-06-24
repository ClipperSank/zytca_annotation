import React from 'react';
import type { ActionButtonProps } from '../../types';


const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default',
  title 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'delete':
        return 'text-red-500 hover:text-red-700 hover:underline';
      case 'view':
        return 'text-blue-500 hover:text-blue-700';
      default:
        return 'text-gray-500 hover:text-gray-700';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`text-sm transition-colors ${getVariantClasses()}`}
      title={title}
    >
      {children}
    </button>
  );
};

export default ActionButton;
