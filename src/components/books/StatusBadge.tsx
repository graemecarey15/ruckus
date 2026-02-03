import type { ReadingStatus } from '@/types';

interface StatusBadgeProps {
  status: ReadingStatus;
}

const statusConfig: Record<ReadingStatus, { label: string; className: string }> = {
  want_to_read: {
    label: 'TBR',
    className: 'bg-yellow-100 text-yellow-800',
  },
  currently_reading: {
    label: 'Reading',
    className: 'bg-green-100 text-green-800',
  },
  finished: {
    label: 'Finished',
    className: 'bg-blue-100 text-blue-800',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
