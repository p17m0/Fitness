import React, { useEffect, useCallback } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal */}
      <div
        className={`
          relative z-10 w-full ${sizeClasses[size]} bg-gray-light border-4 border-gray-dark
          animate-scale-in
        `}
        style={{ boxShadow: '12px 12px 0px 0px #1A1A1A' }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b-4 border-gray-dark bg-gray-light">
            <h3 className="font-display font-bold text-xl uppercase tracking-wide">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-gray-dark"
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Preset
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default',
  loading = false,
}) => {
  const buttonClass = variant === 'danger'
    ? 'brutal-button-danger'
    : variant === 'warning'
      ? 'brutal-button bg-warning'
      : 'brutal-button';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          {variant !== 'default' && (
            <div className={`p-3 rounded ${variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <AlertTriangle
                size={24}
                className={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}
              />
            </div>
          )}
          <p className="font-body text-gray-medium leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="brutal-button-secondary flex-1"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${buttonClass} flex-1 flex items-center justify-center gap-2`}
            disabled={loading}
          >
            {loading && <span className="loader" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};



