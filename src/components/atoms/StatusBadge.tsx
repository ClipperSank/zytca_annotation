import React from "react";
import type { StatusBadgeProps } from "../../types";
const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive }) => {
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded ${
        isActive
          ? "bg-green-100 text-green-600 border border-green-400"
          : "bg-red-100 text-red-600 border border-red-400"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

export default StatusBadge;
