import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSuccess,
  onNavigateToLogin,
  onNavigateToLanding,
}) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const { error, session, user } = await signUp(email.trim(), password);
      if (error) {
        setErrorMessage(error.message || 'Failed to create account.');
      } else if (session) {
        // Automatically logged in without email verification requirement
        onSuccess();
      } else if (user) {
        // Confirmation email sent
        setVerificationRequired(true);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign up.');
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
            Create an account
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1.5">
            Join TravelPilot to experience adaptive, intelligent trip planning
          </p>
        </div>

        {/* Confirmation Email Sent Banner */}
        {verificationRequired ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-secondary/15 text-secondary mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
            </div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
              Verification email sent
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed">
              We have sent a verification link to <strong className="text-on-surface">{email}</strong>. Please check your inbox and confirm your email to start exploring.
            </p>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-3 px-6 rounded-full bg-primary text-on-primary font-semibold text-sm hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Error Alert Box */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 text-error text-xs sm:text-sm animate-fadeIn">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signup-email"
                  className="font-label-sm text-xs text-on-surface-variant font-medium"
                >
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[18px] text-on-surface-variant/60 pointer-events-none">
                    mail
                  </span>
                  <input
                    id="signup-email"
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
                  htmlFor="signup-password"
                  className="font-label-sm text-xs text-on-surface-variant font-medium"
                >
                  Password (min. 6 characters)
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[18px] text-on-surface-variant/60 pointer-events-none">
                    lock
                  </span>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
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

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirm-password"
                  className="font-label-sm text-xs text-on-surface-variant font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[18px] text-on-surface-variant/60 pointer-events-none">
                    lock_reset
                  </span>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-surface-container-low border border-outline-variant/40 font-body-md text-sm text-on-surface focus:outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-6 mt-2 rounded-full bg-primary text-on-primary font-semibold font-label-md text-sm sm:text-base hover:bg-neutral-800 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
              <p className="font-body-sm text-xs text-on-surface-variant">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-secondary hover:underline font-semibold cursor-pointer ml-1"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
