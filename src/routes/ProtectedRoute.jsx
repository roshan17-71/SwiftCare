import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute wraps any page that requires authentication.
 *
 * Props:
 *   - children:      The page/component to render if access is allowed.
 *   - requireAdmin:  (optional) If true, only admins can access this page.
 *
 * Usage:
 *   <ProtectedRoute>           → any logged-in user
 *   <ProtectedRoute requireAdmin>  → admin only
 *
 * NOTE: Actual <Route> wiring happens in Phase 6 when React Router is added.
 *       This component is ready and will be dropped in at that point.
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

  // Not logged in at all → show a simple "not authorized" message
  // (In Phase 6 this becomes a redirect to /login via React Router)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  // Logged in but wrong role (patient trying to reach admin page)
  if (requireAdmin && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // All checks passed — render the protected content
  return children;
}

