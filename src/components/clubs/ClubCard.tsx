import { Link } from 'react-router-dom';
import type { Club } from '@/types';

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Link
      to={`/club/${club.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        {club.cover_image_url ? (
          <img
            src={club.cover_image_url}
            alt={club.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{club.name}</h3>
          {club.description && (
            <p className="text-sm text-gray-600 line-clamp-1">{club.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
