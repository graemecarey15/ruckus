interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {percentage}%
          </span>
        )}
      </div>
      {showLabel && total > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {current} of {total} pages
        </p>
      )}
    </div>
  );
}
