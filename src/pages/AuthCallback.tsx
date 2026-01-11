import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();

      // Get stored return URL
      const returnTo = localStorage.getItem('authReturnTo') || '/library';
      localStorage.removeItem('authReturnTo');

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=auth_failed');
      } else {
        navigate(returnTo);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Signing you in...</p>
    </div>
  );
}
