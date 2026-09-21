import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAppointmentById, cancelAppointment } from '../../services/appointments';
import { formatTime } from '../../utils/time';

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppointmentById(id);
      if (!data) {
        throw new Error('Appointment not found.');
      }
      setAppointment(data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError(err.message || 'Failed to load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelAppointment(id);
      setShowCancelModal(false);
      // Reload appointment details to reflect cancelled status
      await fetchDetails();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-gray-500 text-sm">Loading appointment details...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-4">
          <p className="font-semibold mb-1">Unable to Load Appointment</p>
          <p className="text-sm">{error || 'Appointment not found.'}</p>
        </div>
        <Link
          to="/patient/appointments"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to My Appointments
        </Link>
      </div>
    );
  }

  const doctor = appointment.doctors;
  const slot = appointment.appointment_slots;
  const isBooked = appointment.status === 'booked';
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/patient/appointments"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          ← Back to My Appointments
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden mb-6">
        {/* Header with Status */}
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Ref: {appointment.id}</p>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              isBooked
                ? 'bg-blue-100 text-blue-800'
                : isCompleted
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            ● {appointment.status}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Doctor Info */}
          <div className="flex items-start gap-4">
            {doctor?.photo_url ? (
              <img
                src={doctor.photo_url}
                alt={doctor.full_name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-blue-100 shrink-0">
                {doctor?.full_name?.charAt(0) || 'D'}
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-gray-900">{doctor?.full_name}</h2>
              <p className="text-sm font-semibold text-blue-600">{doctor?.specialization}</p>
              {doctor?.department && (
                <p className="text-xs text-gray-500 mt-0.5">Department: {doctor.department}</p>
              )}
              {doctor?.qualification && (
                <p className="text-xs text-gray-500">🎓 {doctor.qualification}</p>
              )}
            </div>
          </div>

          {/* Schedule Breakdown */}
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Consultation Date</p>
              <p className="font-bold text-gray-900 mt-1">📅 {slot?.slot_date}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Time Slot</p>
              <p className="font-bold text-gray-900 mt-1">
                🕒 {slot ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}` : '—'}
              </p>
            </div>
          </div>

          {/* Booking Metadata */}
          <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-4">
            <p>
              <span className="font-medium text-gray-700">Booked On:</span>{' '}
              {new Date(appointment.created_at).toLocaleString()}
            </p>
          </div>

          {/* Hospital Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-2 border border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">Important Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Please reach the OPD department 15 minutes before your scheduled slot.</li>
              <li>Carry a valid photo ID and any prior medical records or prescriptions.</li>
              <li>If you are unable to attend, please cancel your appointment so other patients can book.</li>
            </ul>
          </div>
        </div>

        {/* Action Footer */}
        {isBooked && (
          <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6 flex justify-end">
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Cancel Appointment
            </button>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Appointment?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your scheduled appointment with{' '}
              <strong>{doctor?.full_name}</strong> on <strong>{slot?.slot_date}</strong>? This slot will become available for other patients.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
