import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { AuthCallback } from '@/pages/AuthCallback';
import { Dashboard } from '@/pages/Dashboard';
import { MyLibrary } from '@/pages/MyLibrary';
import { BookSearch } from '@/pages/BookSearch';
import { BookDetail } from '@/pages/BookDetail';
import { Clubs } from '@/pages/Clubs';
import { ClubDetail } from '@/pages/ClubDetail';
import { MemberProfile } from '@/pages/MemberProfile';
import { Settings } from '@/pages/Settings';
import { JoinClub } from '@/pages/JoinClub';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/join/:inviteCode" element={<JoinClub />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/library" element={<MyLibrary />} />
                <Route path="/search" element={<BookSearch />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/club/:id" element={<ClubDetail />} />
                <Route path="/club/:clubId/member/:memberId" element={<MemberProfile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
