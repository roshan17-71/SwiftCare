import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors } from '../../services/doctors';
import { getAllAppointments } from '../../services/appointments';
import { getTodayDateString, formatTime } from '../../utils/time';

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = getTodayDateString();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [docsData, appsData] = await Promise.all([
          getDoctors(),
          getAllAppointments(),
        ]);
        setDoctors(docsData || []);
        setAppointments(appsData || []);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalActiveDoctors = doctors.filter((d) => d.is_active).length;

  const todayAppointments = appointments.filter(
    (app) => app.appointment_slots?.slot_date === today
  );

  const upcomingBookedAppointments = appointments.filter(
    (app) =>
      app.status === 'booked' &&
      app.appointment_slots?.slot_date >= today
  );

  const completedCount = appointments.filter((app) => app.status === 'completed').length;

  const recentAppointments = appointments.slice(0, 5);

  return (
    <div>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          Hospital operations overview, doctor rosters, and appointment management.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Active Doctors */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 border-l-4 border-l-blue-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Active Doctors
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {loading ? '—' : totalActiveDoctors}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total added: {doctors.length}</p>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 border-l-4 border-l-green-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Today's Visits
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {loading ? '—' : todayAppointments.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Date: {today}</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 border-l-4 border-l-yellow-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Upcoming Booked
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {loading ? '—' : upcomingBookedAppointments.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Awaiting consultation</p>
        </div>

        {/* Completed Visits */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 border-l-4 border-l-purple-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Completed Visits
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {loading ? '—' : completedCount}
          </p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/admin/doctors"
          className="bg-white hover:border-blue-300 rounded-xl p-5 border border-gray-200 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
              Manage Doctors →
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add new specialists, edit bios, or deactivate accounts.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/slots"
          className="bg-white hover:border-green-300 rounded-xl p-5 border border-gray-200 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-green-600 transition-colors">
              Manage Slots →
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Generate OPD consultation slots and schedule doctor rosters.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/appointments"
          className="bg-white hover:border-purple-300 rounded-xl p-5 border border-gray-200 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
              All Appointments →
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Inspect patient appointments and mark completed consultations.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-base">Recent Patient Appointments</h2>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View All ({appointments.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Loading recent appointments...
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No patient appointments on record yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {app.profiles?.full_name || 'Patient'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {app.doctors?.full_name || 'Doctor'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      📅 {app.appointment_slots?.slot_date} (
                      {app.appointment_slots
                        ? formatTime(app.appointment_slots.start_time)
                        : '—'}
                      )
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                          app.status === 'booked'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        ● {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
