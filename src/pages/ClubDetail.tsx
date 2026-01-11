import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClub, getClubMembers, leaveClub } from '@/api/clubs';
import type { Club, ClubMember } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MemberCard } from '@/components/clubs/MemberCard';

export function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);

  useEffect(() => {
    if (id) {
      loadClub();
    }
  }, [id]);

  const loadClub = async () => {
    if (!id) return;
    try {
      const [clubData, membersData] = await Promise.all([
        getClub(id),
        getClubMembers(id),
      ]);
      setClub(clubData);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load club:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMember = members.find((m) => m.user_id === user?.id);
  const isOwner = currentMember?.role === 'owner';

  const handleLeaveClub = async () => {
    if (!club || !user) return;
    if (isOwner) {
      alert('As the owner, you cannot leave. Transfer ownership first or delete the club.');
      return;
    }
    if (!confirm('Are you sure you want to leave this club?')) return;

    await leaveClub(club.id, user.id);
    navigate('/clubs');
  };

  const inviteLink = club ? `${window.location.origin}/join/${club.invite_code}` : '';

  const copyInviteLink = () => {
    if (club) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Club not found</h2>
        <Link to="/clubs" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to clubs
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/clubs"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to clubs
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {club.cover_image_url ? (
              <img
                src={club.cover_image_url}
                alt={club.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
              {club.description && (
                <p className="text-gray-600 mt-1">{club.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {members.length} member{members.length !== 1 && 's'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowInviteCode(!showInviteCode)}>
              {showInviteCode ? 'Hide Code' : 'Invite'}
            </Button>
            {!isOwner && (
              <Button variant="ghost" size="sm" onClick={handleLeaveClub}>
                Leave
              </Button>
            )}
          </div>
        </div>

        {showInviteCode && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Share this link to invite others:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 text-sm"
              />
              <Button size="sm" variant="secondary" onClick={copyInviteLink}>
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} clubId={club.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
