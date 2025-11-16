import { BarChart3, LogOut } from 'lucide-react';

type NavigationItem = 'dashboard' | 'upload' | 'stories' | 'activity';

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  userRole: string;
  activeNav: NavigationItem;
  onNavChange: (nav: NavigationItem) => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  userName,
  userEmail,
  userRole,
  activeNav,
  onNavChange,
  onLogout,
}: DashboardHeaderProps) {
  const navItems: { id: NavigationItem; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'upload', label: 'Upload Data' },
    { id: 'stories', label: 'Stories' },
    { id: 'activity', label: 'Activity' },
  ];

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                Leaders Pulse StoryTeller
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavChange(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeNav === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* subtle avatar (non-interactive) */}
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
              aria-hidden
              title={userName}
            >
              {initial}
            </div>

            {/* single Logout button, red-themed & clear styling */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
