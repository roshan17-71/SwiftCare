import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyAppointments } from '../../services/appointments';
import { getTodayDateString, formatTime } from '../../utils/time';

export default function PatientDashboardPage() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = getTodayDateString();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyAppointments();
        setAppointments(data || []);
      } catch (err) {
        console.error('Error fetching dashboard appointments:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter upcoming appointments (booked & date >= today)
  const upcomingAppointments = appointments
    .filter(
      (app) =>
        app.status === 'booked' &&
        app.appointment_slots?.slot_date >= today
    )
    .sort((a, b) => {
      const dateA = a.appointment_slots?.slot_date || '';
      const dateB = b.appointment_slots?.slot_date || '';
      return dateA.localeCompare(dateB);
    });

  const completedCount = appointments.filter((app) => app.status === 'completed').length;
  const cancelledCount = appointments.filter((app) => app.status === 'cancelled').length;
  const nextAppointment = upcomingAppointments[0] || null;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Patient'} 👋
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Here is your OPD appointment summary and healthcare activity.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 border-l-4 border-l-blue-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Upcoming Visits
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {loading ? '—' : upcomingAppointments.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 border-l-4 border-l-green-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Completed Visits
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {loading ? '—' : completedCount}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 border-l-4 border-l-gray-400">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Cancelled
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            {loading ? '—' : cancelledCount}
          </p>
        </div>
      </div>

      {/* Spotlight: Next Upcoming Appointment */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Next Scheduled Consultation
        </h2>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            Loading next appointment...
          </div>
        ) : nextAppointment ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {nextAppointment.doctors?.photo_url ? (
                <img
                  src={nextAppointment.doctors.photo_url}
                  alt={nextAppointment.doctors.full_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center border-2 border-white shadow-xs">
                  {nextAppointment.doctors?.full_name?.charAt(0) || 'D'}
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Upcoming
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {nextAppointment.doctors?.full_name}
                </h3>
                <p className="text-xs text-blue-600 font-semibold">
                  {nextAppointment.doctors?.specialization}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-700 font-medium">
                  <span>📅 {nextAppointment.appointment_slots?.slot_date}</span>
                  <span>
                    🕒{' '}
                    {formatTime(nextAppointment.appointment_slots?.start_time)} –{' '}
                    {formatTime(nextAppointment.appointment_slots?.end_time)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/patient/appointments/${nextAppointment.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors self-stretch sm:self-auto text-center"
            >
              View Appointment
            </Link>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-600 text-sm mb-4">
              You do not have any upcoming doctor consultations scheduled.
            </p>
            <Link
              to="/patient/doctors"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors inline-block"
            >
              Book an Appointment
            </Link>
          </div>
        )}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/patient/doctors"
          className="bg-white hover:border-blue-300 rounded-xl p-5 border border-gray-200 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
              Find a Doctor
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Search by medical specialty and schedule your visit.
            </p>
          </div>
          <span className="text-xl text-gray-400 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>

        <Link
          to="/patient/appointments"
          className="bg-white hover:border-blue-300 rounded-xl p-5 border border-gray-200 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
              My Appointments
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Check all upcoming schedules and past consultation history.
            </p>
          </div>
          <span className="text-xl text-gray-400 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
