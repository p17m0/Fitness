import React from 'react';
import { Dumbbell } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', text, fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-orange-primary border-t-transparent rounded-full animate-spin" />
      </div>
      {text && (
        <p className="font-display font-bold text-sm uppercase tracking-wider text-gray-medium animate-pulse-soft">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-cream/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Inline button loader
export const ButtonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`loader ${className}`} />
);

// Page loading state with branding
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Загрузка...' }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 animate-fade-in">
    <div className="relative">
      <div className="w-20 h-20 bg-orange-primary border-4 border-gray-dark brutal-shadow flex items-center justify-center">
        <Dumbbell size={40} className="text-white animate-pulse-soft" />
      </div>
      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gray-dark rounded-full animate-bounce" />
    </div>
    <p className="font-display font-bold text-lg uppercase tracking-wider text-gray-medium">
      {text}
    </p>
  </div>
);



