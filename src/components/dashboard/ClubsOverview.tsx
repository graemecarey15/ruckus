import { Link } from 'react-router-dom';
import type { Club } from '@/types';

interface ClubsOverviewProps {
  clubs: Club[];
}

export function ClubsOverview({ clubs }: ClubsOverviewProps) {
  if (clubs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Clubs</h2>
        <p className="text-gray-500 text-sm">You haven't joined any book clubs yet.</p>
        <Link
          to="/clubs"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block"
        >
          Create or join a club
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Clubs</h2>
      <div className="space-y-3">
        {clubs.slice(0, 5).map((club) => (
          <Link
            key={club.id}
            to={`/club/${club.id}`}
            className="flex items-center gap-3 hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          >
            {club.cover_image_url ? (
              <img
                src={club.cover_image_url}
                alt={club.name}
                className="w-10 h-10 rounded object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center">
                <span className="text-lg">📚</span>
              </div>
            )}
            <span className="font-medium text-gray-900 text-sm">{club.name}</span>
          </Link>
        ))}
      </div>
      {clubs.length > 5 && (
        <Link
          to="/clubs"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-4 inline-block"
        >
          View all ({clubs.length})
        </Link>
      )}
    </div>
  );
}
