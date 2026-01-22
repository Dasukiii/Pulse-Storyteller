import { ArrowRight, BarChart3, LogIn, Eye, EyeOff } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import kadoshIcon from '../kadosh-ai-icon.png';

interface LandingPageProps {
  onGetStarted: () => void;
  showAuthModal: boolean;
  onCloseAuthModal: () => void;
  onAuthSuccess: () => void;
}

export default function LandingPage({ onGetStarted, showAuthModal, onCloseAuthModal, onAuthSuccess }: LandingPageProps) {
  const { signIn, signUp } = useAuth();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    role: '',
  });

  // NEW: PDPA acceptance state - required for sign up
  const [acceptedPDPA, setAcceptedPDPA] = useState(false);

  const handleLoginClick = () => {
    onGetStarted();
  };

  // When switching modes, reset PDPA acceptance
  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setAuthError('');
    setShowEmailConfirmation(false);
    setAcceptedPDPA(false);
  };

  // When closing modal, also reset PDPA to avoid stale consent for next open
  const handleCloseModal = () => {
    setAcceptedPDPA(false);
    setAuthError('');
    setShowEmailConfirmation(false);
    onCloseAuthModal();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    setShowEmailConfirmation(false);

    try {
      // Enforce PDPA acceptance for sign up
      if (mode === 'signup' && !acceptedPDPA) {
        setAuthError('You must accept the PDPA / privacy policy to create an account.');
        setAuthLoading(false);
        return;
      }

      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        onAuthSuccess();
      } else {
        const result = await signUp(formData.email, formData.password, formData.name, formData.companyName, formData.role);
        if (result.session) {
          // successful immediate session
          setAcceptedPDPA(false);
          onAuthSuccess();
        } else {
          // sign-up that requires email confirmation
          setShowEmailConfirmation(true);
          // keep acceptedPDPA flagged until user closes modal (we already reset when closing)
        }
      }
    } catch (error: any) {
      setAuthError(error?.message || 'An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <>
      {/* Google Font Import and Body Style */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Figtree', sans-serif;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 font-figtree">
        <header className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-white drop-shadow-lg" />
              <h1 className="text-2xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-pulse">
                Leaders Pulse StoryTeller
              </h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Turn eNPS Data Into<br />Actionable Stories
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                Insert your eNPS Survey Data to obtain quick story and generate action
              </p>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xl px-12 py-5 rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-400/50 group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Upload Your Data
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Import your eNPS and pulse survey results
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-purple-400/50 group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  AI-Powered Stories
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Get narrative insights and sentiment analysis
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-emerald-400/50 group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-4xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Smart Actions
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Receive action recommendations based on employee's comments
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="container mx-auto px-4 py-12 mt-12 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-sm">Powered by</span>
              <a href="https://kadoshai.com/" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
                <img src={kadoshIcon} alt="Kadosh AI" className="h-7 object-contain" />
              </a>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <p className="text-sm text-white/80 flex items-center gap-2">
                Copyright © 2026
                <img src={kadoshIcon} alt="Kadosh AI" className="h-5 object-contain inline-block" />
                All rights reserved.
              </p>
              <a
                href="/privacy"
                className="text-sm text-white/80 hover:text-white transition-colors underline"
              >
                PDPA Policy
              </a>
            </div>
          </div>
        </footer>
      </div>

      {showAuthModal && (
        <AuthModalIntegrated
          mode={mode}
          formData={formData}
          onFormDataChange={setFormData}
          onModeChange={handleModeChange}
          onSubmit={handleAuthSubmit}
          onClose={handleCloseModal}
          error={authError}
          loading={authLoading}
          showEmailConfirmation={showEmailConfirmation}
          acceptedPDPA={acceptedPDPA}
          onAcceptedPDPAChange={setAcceptedPDPA}
        />
      )}
    </>
  );
}

interface AuthModalIntegratedProps {
  mode: 'login' | 'signup';
  formData: any;
  onFormDataChange: (data: any) => void;
  onModeChange: (mode: 'login' | 'signup') => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  error: string;
  loading: boolean;
  showEmailConfirmation?: boolean;
  acceptedPDPA: boolean;
  onAcceptedPDPAChange: (b: boolean) => void;
}

function AuthModalIntegrated({
  mode,
  formData,
  onFormDataChange,
  onModeChange,
  onSubmit,
  onClose,
  error,
  loading,
  showEmailConfirmation,
  acceptedPDPA,
  onAcceptedPDPAChange,
}: AuthModalIntegratedProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {mode === 'login' ? (
              <>
                <LogIn className="w-6 h-6 text-blue-600" />
                Login
              </>
            ) : (
              <>
                <span className="text-blue-600">👤</span>
                Sign Up
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {showEmailConfirmation && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium">Check your email</p>
                  <p className="mt-1">Confirmation email has been sent to <strong>{formData.email}</strong>. Click the confirmation link to activate your account.</p>
                </div>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your company name"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., HR Manager, People Analytics Lead, etc."
                required
              />

              {/* PDPA checkbox required for signup */}
              <div className="mt-4 flex items-start gap-3">
                <input
                  id="pdpa-modal"
                  type="checkbox"
                  checked={acceptedPDPA}
                  onChange={(e) => onAcceptedPDPAChange(e.target.checked)}
                  className="mt-1 accent-blue-500 w-4 h-4 rounded"
                />
                <label htmlFor="pdpa-modal" className="text-sm text-gray-600">
                  I agree to the <a href="/privacy" target="_blank" rel="noreferrer" className="text-blue-600 underline">PDPA / privacy policy</a> and consent to my data being used for account creation and service personalization.
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : mode === 'login' ? (
              'Login'
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              {mode === 'login' ? (
                <>Don't have an account? <span className="underline">Sign Up</span></>
              ) : (
                <>Already have an account? <span className="underline">Login</span></>
              )}
            </button>
          </div>

          <div className="text-center pt-4 pb-2">
            <a
              href="https://kadoshai.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Powered by
              <img
                src={kadoshIcon}
                alt="Kadosh AI"
                className="h-6 object-contain"
              />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
