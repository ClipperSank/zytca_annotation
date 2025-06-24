export type ButtonVariant = 'primary' | 'danger' | 'selected' | 'delete' | 'view' | 'default';

export interface ButtonProps {
  onClick: () => void;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

export interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'delete' | 'view' | 'default';
  title?: string;
}

export interface StatusBadgeProps {
  isActive: boolean;
}

export interface ToolButtonProps {
  isActive: boolean;
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}