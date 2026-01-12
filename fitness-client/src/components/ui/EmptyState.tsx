import React from 'react';
import { LucideIcon, Package, Calendar, Dumbbell, Wallet } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Package,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gray-light border-4 border-gray-dark brutal-shadow animate-float">
        <Icon size={36} className="text-orange-primary" />
      </div>
      <h4 className="font-display font-bold text-xl uppercase tracking-wide mb-2">{title}</h4>
      <p className="font-body text-gray-medium max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <button onClick={action.onClick} className="brutal-button">
          {action.label}
        </button>
      )}
    </div>
  );
};

// Preset empty states
export const NoBookingsState: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
  <EmptyState
    icon={Calendar}
    title="Нет бронирований"
    description="У вас пока нет активных бронирований. Забронируйте слот в одном из наших залов!"
    action={onNavigate ? { label: 'Перейти к залам', onClick: onNavigate } : undefined}
  />
);

export const NoProgramsState: React.FC = () => (
  <EmptyState
    icon={Dumbbell}
    title="Программы не найдены"
    description="Программы тренировок скоро появятся. Следите за обновлениями!"
  />
);

export const NoSubscriptionsState: React.FC = () => (
  <EmptyState
    icon={Wallet}
    title="Нет активных абонементов"
    description="Выберите подходящий абонемент и начните тренироваться уже сегодня!"
  />
);

export const AuthRequiredState: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
  <EmptyState
    icon={Package}
    title="Требуется авторизация"
    description="Войдите в систему или зарегистрируйтесь, чтобы получить доступ к этому разделу."
    action={onNavigate ? { label: 'Войти', onClick: onNavigate } : undefined}
  />
);



