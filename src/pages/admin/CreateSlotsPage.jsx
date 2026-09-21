import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getDoctors } from '../../services/doctors';
import { createSlots } from '../../services/slots';
import { generateTimeSlots, formatTime, getTodayDateString } from '../../utils/time';

export default function CreateSlotsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryDoctorId = searchParams.get('doctorId') || '';
  const queryDate = searchParams.get('date') || getTodayDateString();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(queryDoctorId);
  const [slotDate, setSlotDate] = useState(queryDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [durationMinutes, setDurationMinutes] = useState(15);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const docs = await getDoctors();
        setDoctors(docs || []);
        if (docs && docs.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(docs[0].id);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors list.');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // 2. Compute generated preview slots in real-time
  const previewSlots = useMemo(() => {
    return generateTimeSlots(startTime, endTime, parseInt(durationMinutes, 10));
  }, [startTime, endTime, durationMinutes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }

    if (!slotDate) {
      setError('Please select a date.');
      return;
    }

    if (previewSlots.length === 0) {
      setError('Invalid time range or duration. OPD End Time must be later than Start Time.');
      return;
    }

    setSubmitting(true);

    try {
      const slotsToInsert = previewSlots.map((slot) => ({
        doctor_id: selectedDoctorId,
        slot_date: slotDate,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_booked: false,
      }));

      await createSlots(slotsToInsert);

      // Redirect back to Manage Slots view with doctor and date pre-selected
      navigate(`/admin/slots?doctorId=${selectedDoctorId}&date=${slotDate}`);
    } catch (err) {
      console.error('Error creating slots:', err);
      setError(err.message || 'Failed to generate appointment slots.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/admin/slots?doctorId=${selectedDoctorId}&date=${slotDate}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2"
        >
          ← Back to Manage Slots
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Generate OPD Appointment Slots</h1>
        <p className="text-gray-500 text-sm">
          Auto-generate scheduled back-to-back consultation slots for a doctor on a specific date.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Doctor & Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              disabled={loadingDoctors || doctors.length === 0}
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {doctors.length === 0 ? (
                <option value="">No doctors available</option>
              ) : (
                doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.full_name} ({doc.specialization})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              OPD Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Time Range & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              OPD Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              OPD End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Slot Duration <span className="text-red-500">*</span>
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes (1 hour)</option>
            </select>
          </div>
        </div>

        {/* Preview Section */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Slot Preview ({previewSlots.length} {previewSlots.length === 1 ? 'Slot' : 'Slots'})
            </h3>
            {selectedDoctor && (
              <span className="text-xs text-gray-500">
                For {selectedDoctor.full_name} on {slotDate}
              </span>
            )}
          </div>

          {previewSlots.length === 0 ? (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm text-center">
              ⚠️ Please ensure the <strong>End Time</strong> is later than the <strong>Start Time</strong> to generate slots.
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-56 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {previewSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 px-3 py-1.5 rounded text-xs font-semibold text-gray-700 text-center shadow-2xs"
                  >
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/admin/slots?doctorId=${selectedDoctorId}&date=${slotDate}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || previewSlots.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Generating Slots...' : `Confirm & Save ${previewSlots.length} Slots`}
          </button>
        </div>
      </form>
    </div>
  );
}
