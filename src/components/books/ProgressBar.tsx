import { useRef } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  interactive?: boolean;
  onProgressChange?: (page: number) => void;
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  interactive = false,
  onProgressChange,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onProgressChange || !barRef.current || total <= 0) return;

    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newPage = Math.round(clickPercentage * total);
    onProgressChange(newPage);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div
          ref={barRef}
          className={`flex-1 bg-gray-200 rounded-full h-2 overflow-hidden relative ${
            interactive ? 'cursor-pointer hover:h-3 transition-all' : ''
          }`}
          onClick={handleClick}
          title={interactive ? 'Click to set progress' : undefined}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              interactive ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
          {interactive && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-medium text-white drop-shadow">{percentage}%</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
          {percentage}%
        </span>
      </div>
      {showLabel && total > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {current} of {total} pages
        </p>
      )}
    </div>
  );
}
