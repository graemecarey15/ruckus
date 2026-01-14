import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { name: 'Home', path: '/dashboard' },
  { name: 'Library', path: '/library' },
  { name: 'Search', path: '/search' },
  { name: 'Clubs', path: '/clubs' },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 md:hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (tab.path === '/clubs' && location.pathname.startsWith('/club')) ||
            (tab.path === '/dashboard' && location.pathname === '/dashboard');

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
