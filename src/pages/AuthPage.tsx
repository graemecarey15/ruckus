import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithMagicLink } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AuthPage() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle auth callback and return URL
  const isCallback = searchParams.get('type') === 'magiclink';
  const returnTo = searchParams.get('returnTo') || '/library';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (user || isCallback) {
    return <Navigate to={returnTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Store returnTo so callback can use it
      if (returnTo !== '/library') {
        localStorage.setItem('authReturnTo', returnTo);
      }
      await signInWithMagicLink(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check your email
          </h1>
          <p className="text-gray-600 mb-4">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in your email to sign in. The link will expire in 1 hour.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="mt-6 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Ruckus
          </h1>
          <p className="text-gray-600">
            Sign in with your email to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" loading={isLoading} className="w-full">
            Send magic link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          No password needed. We'll send you a secure link to sign in.
        </p>
      </div>
    </div>
  );
}
