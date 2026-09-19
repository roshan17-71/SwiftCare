import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  const { user, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      
      {/* Navbar placeholder */}
      <header className="w-full bg-blue-600 p-4 absolute top-0 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">SwiftCare Auth Test</h1>
        {user && (
          <button 
            onClick={signOut} 
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm font-semibold"
          >
            Logout
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mt-16 w-full flex justify-center items-center">
        {user ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg w-full">
            <h2 className="text-3xl font-bold text-green-600 mb-4">You are logged in!</h2>
            <p className="text-gray-700 mb-2">Welcome, <span className="font-semibold">{user.email}</span></p>
            <p className="text-gray-500 text-sm">Your user ID: {user.id}</p>
          </div>
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
