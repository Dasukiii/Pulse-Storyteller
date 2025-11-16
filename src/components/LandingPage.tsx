import { ArrowRight, LogIn, BarChart3 } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    role: '',
  });

  const handleLoginClick = () => {
    onGetStarted();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.name, formData.companyName, formData.role);
      }
      onAuthSuccess();
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">
                Leaders Pulse StoryTeller
              </h1>
            </div>
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-2.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Turn eNPS Data Into<br />Actionable Stories
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                Insert your eNPS Survey Data to obtain quick story and generate action
              </p>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xl px-12 py-5 rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-3xl"
              >
                Get Started
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Upload Your Data
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Import your eNPS and pulse survey results
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  AI-Powered Stories
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Get narrative insights and sentiment analysis
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
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
      </div>

      {showAuthModal && (
        <AuthModalIntegrated
          mode={mode}
          formData={formData}
          onFormDataChange={setFormData}
          onModeChange={setMode}
          onSubmit={handleAuthSubmit}
          onClose={onCloseAuthModal}
          error={authError}
          loading={authLoading}
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
}: AuthModalIntegratedProps) {

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
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
              minLength={6}
            />
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
        </form>
      </div>
    </div>
  );
}
