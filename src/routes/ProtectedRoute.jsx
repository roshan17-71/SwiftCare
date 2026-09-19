import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute wraps any page that requires authentication.
 *
 * Props:
 *   - children:      The page/component to render if access is allowed.
 *   - requireAdmin:  (optional) If true, only admins can access this page.
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuth();

  // Still fetching session / profile — render nothing yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Not logged in → redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in as patient trying to reach an admin-only page → redirect to patient dashboard
  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/patient/dashboard" replace />;
  }

  // Logged in as admin trying to reach a patient-only page → redirect to admin dashboard
  if (!requireAdmin && profile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // All checks passed — render the page
  return children;
}
