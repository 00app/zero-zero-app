
import { useMemo } from 'react';

interface PipProgressProps {
  current: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'stepped';
  className?: string;
  showLabels?: boolean;
  labels?: string[];
  onClick?: (index: number) => void;
}

export function PipProgress({
  current,
  total,
  size = 'md',
  variant = 'default',
  className = '',
  showLabels = false,
  labels = [],
  onClick
}: PipProgressProps) {
  const pips = useMemo(() => {
    return Array.from({ length: total }, (_, index) => {
      const pipIndex = index + 1;
      let status: 'completed' | 'active' | 'inactive' = 'inactive';
      
      if (pipIndex < current) {
        status = 'completed';
      } else if (pipIndex === current) {
        status = 'active';
      }
      
      return {
        index: pipIndex,
        status,
        label: labels[index] || `step ${pipIndex}`
      };
    });
  }, [current, total, labels]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-1.5 h-1.5';
      case 'lg':
        return 'w-3 h-3';
      default:
        return 'w-2 h-2';
    }
  };

  const getGapSize = () => {
    switch (size) {
      case 'sm':
        return 'gap-2';
      case 'lg':
        return 'gap-4';
      default:
        return 'gap-3';
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className={`pip-progress ${getGapSize()}`}>
        {pips.map((pip) => (
          <button
            key={pip.index}
            onClick={() => onClick?.(pip.index)}
            disabled={!onClick}
            className={`
              pip ${getSizeClasses()} 
              ${pip.status === 'active' ? 'active' : ''}
              ${pip.status === 'completed' ? 'completed' : ''}
              ${onClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              transition-all duration-300 ease-out
            `}
            title={showLabels ? pip.label : undefined}
          />
        ))}
      </div>
      
      {showLabels && (
        <div className="flex items-center space-x-1 zz-p3 text-muted-foreground">
          <span>{current}</span>
          <span>/</span>
          <span>{total}</span>
        </div>
      )}
    </div>
  );
}
