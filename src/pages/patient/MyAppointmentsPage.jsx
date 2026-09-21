import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppointments, cancelAppointment } from '../../services/appointments';
import { getTodayDateString, formatTime } from '../../utils/time';
import AppointmentCard from '../../components/AppointmentCard';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const today = getTodayDateString();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyAppointments();
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Separate upcoming vs past
  const { upcomingList, pastList } = useMemo(() => {
    const upcoming = [];
    const past = [];

    appointments.forEach((app) => {
      const slotDate = app.appointment_slots?.slot_date;
      // An appointment is upcoming if status is 'booked' AND date is today or later
      if (app.status === 'booked' && slotDate >= today) {
        upcoming.push(app);
      } else {
        past.push(app);
      }
    });

    return { upcomingList: upcoming, pastList: past };
  }, [appointments, today]);

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;
    setCancelling(true);

    try {
      await cancelAppointment(appointmentToCancel.id);
      // Update state locally
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentToCancel.id
            ? { ...app, status: 'cancelled' }
            : app
        )
      );
      setAppointmentToCancel(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your scheduled visits and consultation history.
          </p>
        </div>

        <Link
          to="/patient/doctors"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-2xs self-start sm:self-auto"
        >
          + Book New Appointment
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'upcoming'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming Visits
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {upcomingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'past'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Past & Cancelled
          <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {pastList.length}
          </span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchAppointments}
            className="text-xs underline font-semibold hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Loading your appointments...</p>
        </div>
      ) : activeTab === 'upcoming' ? (
        upcomingList.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-16 text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Upcoming Appointments</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              You do not have any scheduled doctor consultations at this time.
            </p>
            <Link
              to="/patient/doctors"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm inline-block shadow-2xs"
            >
              Browse Doctors & Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingList.map((app) => (
              <AppointmentCard
                key={app.id}
                appointment={app}
                onCancel={(toCancel) => setAppointmentToCancel(toCancel)}
                isCancelling={cancelling && appointmentToCancel?.id === app.id}
              />
            ))}
          </div>
        )
      ) : pastList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-16 text-center">
          <div className="text-4xl mb-3">📂</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Past Appointments</h3>
          <p className="text-gray-500 text-sm">
            You don't have any past or cancelled appointments on record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastList.map((app) => (
            <AppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Appointment?</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <strong className="text-gray-900">
                {appointmentToCancel.doctors?.full_name}
              </strong>{' '}
              on{' '}
              <strong className="text-gray-900">
                {appointmentToCancel.appointment_slots?.slot_date}
              </strong>{' '}
              at{' '}
              <strong className="text-gray-900">
                {formatTime(appointmentToCancel.appointment_slots?.start_time)}
              </strong>
              ? This time slot will be reopened for other patients.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAppointmentToCancel(null)}
                disabled={cancelling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
