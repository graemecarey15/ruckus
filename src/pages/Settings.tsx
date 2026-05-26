import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/api/profiles';
import { deleteAccount } from '@/api/account';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';

export function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExpanded, setDeleteExpanded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      setDeleted(true);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletedDone = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

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

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          type="button"
          onClick={() => setDeleteExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left"
          aria-expanded={deleteExpanded}
        >
          <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${deleteExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {deleteExpanded && (
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account, library, and notes. This cannot be undone.
            </p>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete Account
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          if (deleting || deleted) return;
          setDeleteOpen(false);
          setDeleteConfirm('');
          setDeleteError('');
        }}
        title={deleted ? 'Account deleted' : 'Delete account?'}
      >
        {deleted ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">
                Your account and all of your data have been permanently deleted.
              </p>
            </div>
            <div className="pt-2">
              <Button onClick={handleDeletedDone}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              This will permanently delete your account and all of your data. To
              confirm, type <span className="font-semibold">DELETE</span> below.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
            <div className="flex gap-2 pt-2">
              <Button
                variant="danger"
                loading={deleting}
                disabled={deleteConfirm !== 'DELETE'}
                onClick={handleDelete}
              >
                Permanently delete
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteConfirm('');
                  setDeleteError('');
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
