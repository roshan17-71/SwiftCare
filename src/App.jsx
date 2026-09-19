import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProtectedRoute from './routes/ProtectedRoute';

// --- Simulated admin-only page to test role blocking ---
function AdminOnlyPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Admin Area</h2>
        <p className="text-gray-600">Only admins can see this content.</p>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  const { user, profile, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showAdminTest, setShowAdminTest] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">

      {/* Navbar */}
      <header className="w-full bg-blue-600 p-4 absolute top-0 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">SwiftCare — Phase 5 Test</h1>
        {user && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdminTest((v) => !v)}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm font-semibold"
            >
              {showAdminTest ? 'Back to Welcome' : 'Test Admin Route'}
            </button>
            <button
              onClick={signOut}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mt-16 w-full flex justify-center items-center p-4">
        {user ? (
          showAdminTest ? (
            <AdminOnlyPage />
          ) : (
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg w-full">
              <h2 className="text-3xl font-bold text-green-600 mb-4">You are logged in!</h2>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Name:</span> {profile?.full_name}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">Role:</span>{' '}
                <span className={`px-2 py-0.5 rounded text-sm font-bold ${
                  profile?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {profile?.role ?? 'loading...'}
                </span>
              </p>
              <p className="text-gray-500 text-xs">User ID: {user.id}</p>
            </div>
          )
        ) : (
          showLogin ? (
            <LoginPage onToggleMode={() => setShowLogin(false)} />
          ) : (
            <RegistrationPage onToggleMode={() => setShowLogin(true)} />
          )
        )}
      </main>

    </div>
  );
}

export default App;
