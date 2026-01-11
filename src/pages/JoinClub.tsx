import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClubByInviteCode, joinClub } from '@/api/clubs';
import type { Club } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export function JoinClub() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    // Wait for auth to resolve and user to be available
    if (authLoading || !user || !inviteCode || attempted) return;

    setAttempted(true);
    loadClubAndJoin();
  }, [inviteCode, user, authLoading, attempted]);

  const loadClubAndJoin = async () => {
    if (!user || !inviteCode) return;

    try {
      const clubData = await getClubByInviteCode(inviteCode);
      if (!clubData) {
        setError('Invalid invite code');
        setLoading(false);
        return;
      }
      setClub(clubData);

      // Auto-join
      try {
        await joinClub(clubData.id, user.id);
        setJoined(true);
        setTimeout(() => navigate(`/club/${clubData.id}`), 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join';
        if (message.includes('duplicate')) {
          // Already a member, just redirect
          navigate(`/club/${clubData.id}`);
        } else {
          setError(message);
        }
      }
    } catch (err) {
      setError('Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  // Still checking auth
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not signed in - redirect to auth with return URL
  if (!user) {
    const returnUrl = `/join/${inviteCode}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // Loading club info
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Invalid code
  if (!club) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h1>
          <p className="text-gray-600 mb-4">This invite link is invalid or expired.</p>
          <Button onClick={() => navigate('/clubs')}>Go to Clubs</Button>
        </div>
      </div>
    );
  }

  // Successfully joined
  if (joined) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600">You've joined <strong>{club.name}</strong></p>
          <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show joining state or error
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {club.cover_image_url ? (
            <img
              src={club.cover_image_url}
              alt={club.name}
              className="w-20 h-20 rounded-lg object-cover mx-auto mb-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📚</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{club.name}</h1>
          {error ? (
            <>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/clubs')}>Go to Clubs</Button>
            </>
          ) : (
            <>
              <LoadingSpinner size="sm" />
              <p className="text-gray-600 mt-2">Joining club...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
