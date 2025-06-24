// import React from 'react';

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   active?: boolean;
// }

// export const Button: React.FC<ButtonProps> = ({ active, style, ...rest }) => (
//   <button
//     style={{
//       background: active ? 'yellow' : '#eee',
//       padding: '4px 8px',
//       borderRadius: 5,
//       border: '1px solid #aaa',
//       cursor: 'pointer',
//       ...style,
//     }}
//     {...rest}
//   />
// );
import React from 'react';
import type { ButtonVariant } from '../../types';

interface ButtonProps {
  onClick: () => void;
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, variant = 'primary', children }) => {
  const getStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'selected':
        return 'bg-yellow-300 hover:bg-yellow-400';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border border-gray-400 cursor-pointer transition-colors ${getStyles()}`}
    >
      {children}
    </button>
  );
};

export default Button;