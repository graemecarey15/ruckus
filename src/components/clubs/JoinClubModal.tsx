import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getClubByInviteCode, joinClub } from '@/api/clubs';
import { useAuth } from '@/contexts/AuthContext';
import type { Club } from '@/types';

interface JoinClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (club: Club) => void;
}

export function JoinClubModal({ isOpen, onClose, onJoin }: JoinClubModalProps) {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const club = await getClubByInviteCode(inviteCode.trim());
      if (!club) {
        setError('Invalid invite code');
        setLoading(false);
        return;
      }

      await joinClub(club.id, user.id);
      onJoin(club);
      setInviteCode('');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join club';
      if (message.includes('duplicate')) {
        setError('You are already a member of this club');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a Book Club">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Invite Code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter the invite code"
          required
        />

        <p className="text-sm text-gray-500">
          Ask a club member for the invite code to join their book club.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={loading}>
            Join Club
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
