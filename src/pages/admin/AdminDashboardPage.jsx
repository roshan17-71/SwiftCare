import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage doctors, slots, and appointments.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Doctors</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">—</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Today's Appointments</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">—</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">—</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link to="/admin/doctors" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 text-center">
          Manage Doctors
        </Link>
        <Link to="/admin/slots" className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 text-center">
          Manage Slots
        </Link>
        <Link to="/admin/appointments" className="bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-yellow-700 text-center">
          All Appointments
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Recent Appointments</h2>
        <p className="text-gray-400 text-sm italic">
          Full appointment table will appear here in Phase 12.
        </p>
      </div>
    </div>
  );
}

