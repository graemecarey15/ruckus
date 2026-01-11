import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClub } from '@/api/clubs';
import { useAuth } from '@/contexts/AuthContext';
import type { Club } from '@/types';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (club: Club) => void;
}

export function CreateClubModal({ isOpen, onClose, onCreate }: CreateClubModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const club = await createClub(
        { name: name.trim(), description: description.trim() || null, is_public: isPublic },
        user.id
      );
      onCreate(club);
      setName('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Book Club">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Club Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Smith Family Book Club"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's your club about?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            Make this club public (anyone can join)
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={loading}>
            Create Club
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
