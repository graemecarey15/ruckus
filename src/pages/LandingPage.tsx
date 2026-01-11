import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Track your reading journey
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        Share what you're reading with friends and family. Keep notes, track progress, and discover new books together.
      </p>
      <div className="flex space-x-4">
        {user ? (
          <Link
            to="/library"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Go to My Library
          </Link>
        ) : (
          <>
            <Link
              to="/auth"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Get Started
            </Link>
            <Link
              to="/auth"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Sign In
            </Link>
          </>
        )}
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="p-6">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-semibold text-gray-900 mb-2">Track Your Books</h3>
          <p className="text-gray-600 text-sm">
            Keep a catalog of what you're reading, want to read, and have finished.
          </p>
        </div>
        <div className="p-6">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="font-semibold text-gray-900 mb-2">Take Notes</h3>
          <p className="text-gray-600 text-sm">
            Capture your thoughts, favorite quotes, and chapter summaries.
          </p>
        </div>
        <div className="p-6">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-gray-900 mb-2">Share with Others</h3>
          <p className="text-gray-600 text-sm">
            Create book clubs and see what your friends are reading.
          </p>
        </div>
      </div>
    </div>
  );
}
