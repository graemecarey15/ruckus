import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              Ruckus
            </Link>
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  to="/library"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  My Library
                </Link>
                <Link
                  to="/search"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Find Books
                </Link>
                <Link
                  to="/clubs"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clubs
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.display_name || profile?.username || 'User'}
                    size="sm"
                  />
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.display_name || profile?.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
