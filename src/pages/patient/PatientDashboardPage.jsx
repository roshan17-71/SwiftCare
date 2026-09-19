import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function PatientDashboardPage() {
  const { profile } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Welcome back, {profile?.full_name?.split(' ')[0]} 👋
      </h1>
      <p className="text-gray-500 mb-8">Here's a quick overview of your appointments.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">—</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">—</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-gray-400">
          <p className="text-gray-500 text-sm">Cancelled</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">—</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/patient/doctors" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 text-center">
          Browse Doctors
        </Link>
        <Link to="/patient/appointments" className="border border-blue-600 text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 text-center">
          My Appointments
        </Link>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Recent Appointments</h2>
        <p className="text-gray-400 text-sm italic">
          Full appointment data will appear here in Phase 11.
        </p>
      </div>
    </div>
  );
}

