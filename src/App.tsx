import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && profile) {
    return (
      <Dashboard
        userId={profile.id}
        userName={profile.name}
        userEmail={profile.email}
        userRole={profile.role}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      showAuthModal={showAuthModal}
      onCloseAuthModal={() => setShowAuthModal(false)}
      onAuthSuccess={handleAuthSuccess}
    />
  );
}

export default App;
