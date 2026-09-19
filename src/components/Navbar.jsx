import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide hover:opacity-90">
          🏥 SwiftCare
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Role-based nav links */}
              {profile?.role === 'admin' ? (
                <div className="hidden sm:flex gap-4 text-sm font-medium">
                  <Link to="/admin/dashboard" className="hover:underline">Dashboard</Link>
                  <Link to="/admin/doctors" className="hover:underline">Doctors</Link>
                  <Link to="/admin/slots" className="hover:underline">Slots</Link>
                  <Link to="/admin/appointments" className="hover:underline">Appointments</Link>
                </div>
              ) : (
                <div className="hidden sm:flex gap-4 text-sm font-medium">
                  <Link to="/patient/dashboard" className="hover:underline">Dashboard</Link>
                  <Link to="/patient/doctors" className="hover:underline">Doctors</Link>
                  <Link to="/patient/appointments" className="hover:underline">My Appointments</Link>
                </div>
              )}

              {/* User info + logout */}
              <span className="hidden sm:inline text-sm opacity-80">
                Hi, {profile?.full_name?.split(' ')[0] ?? 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded text-sm font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded hover:bg-blue-50 text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-1.5 rounded text-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

