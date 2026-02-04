import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sendOtpCode, verifyOtpCode } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AuthPage() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const returnTo = searchParams.get('returnTo') || '/library';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={returnTo} replace />;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await sendOtpCode(email);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyOtpCode(email, otpCode);
      // Auth state change will be picked up by AuthContext
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Enter your code
            </h1>
            <p className="text-gray-600">
              We sent a code to <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              type="text"
              label="Verification code"
              placeholder="12345678"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              error={error}
              autoComplete="one-time-code"
              inputMode="numeric"
              required
            />
            <Button type="submit" loading={isLoading} className="w-full">
              Verify code
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setStep('email');
                setOtpCode('');
                setError('');
              }}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Use a different email
            </button>
          </div>
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

        <form onSubmit={handleSendCode} className="space-y-4">
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
            Send code
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          No password needed. We'll send you a code to sign in.
        </p>
      </div>
    </div>
  );
}
