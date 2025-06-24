import React from "react";
import type { ToolButtonProps } from "../../types";

const ToolButton: React.FC<ToolButtonProps> = ({
  isActive,
  icon,
  tooltip,
  onClick,
}) => {
  return (
    <div className="relative group">
      <button
        className={`p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
          isActive
            ? "bg-blue-100 text-blue-600 shadow-sm border border-blue-200"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onClick={onClick}
        title={tooltip}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
        {tooltip}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
      </div>
    </div>
  );
};

export default ToolButton;
