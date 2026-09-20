import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateToSignup: () => void;
  onNavigateToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToSignup,
  onNavigateToLanding,
}) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMessage(error.message || 'Failed to log in. Please check your credentials.');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-margin-mobile md:px-margin py-8 sm:py-14 flex items-center justify-center">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-8 sm:p-10 relative">
        {/* Back to Home Link */}
        <button
          type="button"
          onClick={onNavigateToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-label-sm text-on-surface-variant hover:text-on-surface transition-colors mb-6 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Overview</span>
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm mb-4">
            <span className="material-symbols-outlined text-[24px]">explore</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Welcome back
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1.5">
            Log in to manage and adapt your travel itineraries
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 text-error text-xs sm:text-sm animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="font-label-sm text-xs text-on-surface-variant font-medium"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[18px] text-on-surface-variant/60 pointer-events-none">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-full bg-surface-container-low border border-outline-variant/40 font-body-md text-sm text-on-surface focus:outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="font-label-sm text-xs text-on-surface-variant font-medium"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[18px] text-on-surface-variant/60 pointer-events-none">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-full bg-surface-container-low border border-outline-variant/40 font-body-md text-sm text-on-surface focus:outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-on-surface-variant/60 hover:text-on-surface focus:outline-none transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-semibold font-label-md text-sm sm:text-base hover:bg-neutral-800 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Signup */}
        <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
          <p className="font-body-sm text-xs text-on-surface-variant">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="text-secondary hover:underline font-semibold cursor-pointer ml-1"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
