import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserClubs } from '@/api/clubs';
import type { Club } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClubCard } from '@/components/clubs/ClubCard';
import { CreateClubModal } from '@/components/clubs/CreateClubModal';
import { JoinClubModal } from '@/components/clubs/JoinClubModal';

export function Clubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadClubs();
    }
  }, [user]);

  const loadClubs = async () => {
    if (!user) return;
    try {
      const data = await getUserClubs(user.id);
      setClubs(data);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClubCreated = (club: Club) => {
    setClubs([club, ...clubs]);
  };

  const handleClubJoined = (club: Club) => {
    setClubs([club, ...clubs]);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Book Clubs</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
            Join Club
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>Create Club</Button>
        </div>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          title="No clubs yet"
          description="Create a book club to share your reading journey with friends and family."
          action={
            <div className="flex gap-2 justify-center">
              <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
                Join a Club
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>Create a Club</Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}

      <CreateClubModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleClubCreated}
      />

      <JoinClubModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleClubJoined}
      />
    </div>
  );
}
