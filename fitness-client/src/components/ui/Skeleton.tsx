import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'skeleton';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'rounded border-4 border-gray-200',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'circular' ? width : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Preset skeletons for common use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`brutal-card space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
    <Skeleton variant="text" lines={2} />
    <div className="flex gap-3">
      <Skeleton variant="rectangular" width={100} height={40} />
      <Skeleton variant="rectangular" width={100} height={40} />
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = ''
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white border-4 border-gray-200 p-4 brutal-shadow-sm space-y-2"
        style={{ animationDelay: `${i * 0.1}s` }}
      >
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="50%" height={20} />
          <Skeleton variant="rectangular" width={60} height={24} />
        </div>
        <Skeleton variant="text" width="80%" />
      </div>
    ))}
  </div>
);

export const SlotSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-3 border-4 border-gray-200 bg-white brutal-shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-2">
      <Skeleton variant="circular" width={18} height={18} />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
    <Skeleton variant="text" width="40%" height={12} />
  </div>
);



