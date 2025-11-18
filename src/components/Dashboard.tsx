import { LogOut, Calendar, Users, FileText, TrendingUp } from 'lucide-react';

interface DashboardProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  onLogout: () => void;
}

function getRoleBadgeStyles(role: string) {
  switch (role) {
    case 'Admin':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'Manager':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Employee':
      return 'bg-green-100 text-green-700 border-green-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

export default function Dashboard({ userId, userName, userEmail, userRole, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                1:1 Notes Tracker
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {userName}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeStyles(
                      userRole
                    )}`}
                  >
                    {userRole}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your 1:1 meetings, track progress, and stay organized.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase">
              Upcoming 1:1s
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase">
              Team Members
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase">
              Total Notes
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase">
              Action Items
            </h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Recent 1:1s
            </h3>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No meetings scheduled yet</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Schedule Your First 1:1
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Action Items
            </h3>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No action items yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Action items from your 1:1s will appear here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
