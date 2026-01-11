import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/api/profiles';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      await updateProfile(user.id, {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      });
      await refreshProfile();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name || profile?.username || 'User'}
            size="lg"
          />
          <div>
            <p className="font-medium text-gray-900">@{profile?.username}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Profile updated!</p>}

          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
