import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorById } from '../../services/doctors';
import { getAvailableSlots, bookSlot } from '../../services/appointments';
import { formatTime, getTodayDateString } from '../../utils/time';
import SlotCard from '../../components/SlotCard';

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 1. Fetch Doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoadingDoctor(true);
        setError(null);
        const data = await getDoctorById(doctorId);
        if (!data) {
          throw new Error('Doctor not found.');
        }
        setDoctor(data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError(err.message || 'Failed to load doctor profile.');
      } finally {
        setLoadingDoctor(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  // 2. Fetch available slots whenever date or doctor changes
  const fetchSlots = async () => {
    if (!doctorId || !selectedDate) return;
    try {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlot(null);
      const data = await getAvailableSlots(doctorId, selectedDate);
      setSlots(data || []);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError(err.message || 'Failed to load available slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [doctorId, selectedDate]);

  // 3. Confirm and book the slot
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setBooking(true);
    setError(null);

    try {
      const appointmentResult = await bookSlot(selectedSlot.id);

      // Navigate to confirmation page with booking summary in state
      navigate('/patient/booking-confirmation', {
        state: {
          appointment: appointmentResult,
          doctor,
          slot: selectedSlot,
        },
      });
    } catch (err) {
      console.error('Booking failed:', err);
      setError(
        err.message ||
          'Failed to complete booking. The slot may have just been taken by another patient.'
      );
      setShowConfirmModal(false);
      // Refresh available slots so patient sees updated availability
      fetchSlots();
    } finally {
      setBooking(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-gray-500 text-sm">Loading appointment details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-red-600 font-semibold mb-4">{error || 'Doctor not found.'}</p>
        <Link
          to="/patient/doctors"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
        >
          ← Return to Doctors List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header & Back Link */}
      <div className="mb-6">
        <Link
          to={`/patient/doctors/${doctor.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3"
        >
          ← Back to Doctor Profile
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Book OPD Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select a consultation date and choose an available time slot.
        </p>
      </div>

      {/* Doctor Summary Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6 flex items-center gap-4">
        {doctor.photo_url ? (
          <img
            src={doctor.photo_url}
            alt={doctor.full_name}
            className="w-16 h-16 rounded-xl object-cover border border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 font-bold text-2xl flex items-center justify-center border border-blue-100">
            {doctor.full_name?.charAt(0) || 'D'}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900">{doctor.full_name}</h2>
          <p className="text-sm font-semibold text-blue-600">{doctor.specialization}</p>
          {doctor.department && (
            <p className="text-xs text-gray-500 mt-0.5">Department: {doctor.department}</p>
          )}
        </div>
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          1. Choose Consultation Date
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="date"
            min={getTodayDateString()}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span className="text-xs text-gray-500">
            Showing available OPD slots for <span className="font-semibold text-gray-800">{selectedDate}</span>
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchSlots}
            className="text-xs underline font-semibold hover:text-red-900"
          >
            Refresh Slots
          </button>
        </div>
      )}

      {/* Available Slots Section */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            2. Available Time Slots
          </h2>
          {!loadingSlots && slots.length > 0 && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
              {slots.length} {slots.length === 1 ? 'Slot Available' : 'Slots Available'}
            </span>
          )}
        </div>

        {loadingSlots ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-gray-500 text-xs">Checking slot availability...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-3xl mb-2">🗓️</div>
            <p className="font-semibold text-gray-700 text-sm mb-1">
              No Available Slots on this Date
            </p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              All slots for Dr. {doctor.full_name} on {selectedDate} are either fully booked or have not been scheduled yet. Please select another date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                isSelected={selectedSlot?.id === slot.id}
                onSelect={(s) => setSelectedSlot(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Slot Sticky Bar / Action Footer */}
      {selectedSlot && (
        <div className="sticky bottom-4 bg-white rounded-2xl shadow-xl border border-blue-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Selected Consultation Slot
            </p>
            <p className="text-base font-bold text-gray-900">
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({selectedSlot.slot_date})
              </span>
            </p>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            Confirm & Book Slot
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Your Appointment
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Please review your appointment summary before confirming.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm mb-6 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Doctor:</span>
                <span className="font-semibold text-gray-800">{doctor.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Specialization:</span>
                <span className="font-semibold text-blue-600">{doctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-semibold text-gray-800">{selectedSlot.slot_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="font-semibold text-gray-800">
                  {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Patient:</span>
                <span className="font-semibold text-gray-800">
                  {profile?.full_name || 'Logged-in Patient'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={booking}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={booking}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {booking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Booking...</span>
                  </>
                ) : (
                  'Yes, Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
