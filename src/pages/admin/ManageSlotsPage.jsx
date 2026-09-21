import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDoctors } from '../../services/doctors';
import { getSlotsForDoctorAndDate, deleteSlot } from '../../services/slots';
import { formatTime, getTodayDateString } from '../../utils/time';

export default function ManageSlotsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId') || '';
  const initialDate = searchParams.get('date') || getTodayDateString();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [slots, setSlots] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [deletingSlotId, setDeletingSlotId] = useState(null);

  // 1. Fetch doctors list on mount
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

  // 2. Fetch slots whenever selectedDoctorId or selectedDate changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setError(null);
        const data = await getSlotsForDoctorAndDate(selectedDoctorId, selectedDate);
        setSlots(data);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError(err.message || 'Failed to load slots.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();

    // Keep search params in URL synced for easy sharing/navigation
    setSearchParams({ doctorId: selectedDoctorId, date: selectedDate });
  }, [selectedDoctorId, selectedDate]);

  const handleDeleteSlot = async (slot) => {
    if (slot.is_booked) {
      alert('Cannot delete a slot that has already been booked by a patient.');
      return;
    }

    const confirmMsg = `Delete the ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)} slot?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingSlotId(slot.id);
      await deleteSlot(slot.id);
      setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    } catch (err) {
      console.error('Error deleting slot:', err);
      alert(err.message || 'Failed to delete slot.');
    } finally {
      setDeletingSlotId(null);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const availableSlotsCount = slots.filter((s) => !s.is_booked).length;
  const bookedSlotsCount = slots.filter((s) => s.is_booked).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Slots</h1>
          <p className="text-gray-500 text-sm">View, inspect, and delete OPD appointment slots.</p>
        </div>
        <Link
          to={`/admin/slots/create?doctorId=${selectedDoctorId}&date=${selectedDate}`}
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
        >
          + Create Slots
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Select Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            disabled={loadingDoctors || doctors.length === 0}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {doctors.length === 0 ? (
              <option value="">No doctors available</option>
            ) : (
              doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.full_name} ({doc.specialization}) {doc.is_active ? '' : '— Inactive'}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Content Area */}
      {loadingDoctors || loadingSlots ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Loading appointment slots...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 mb-4">Please add doctors before creating or viewing slots.</p>
          <Link
            to="/admin/doctors/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Add Doctor
          </Link>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Slots Found</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            No OPD slots have been generated for{' '}
            <span className="font-semibold text-gray-800">{selectedDoctor?.full_name}</span> on{' '}
            <span className="font-semibold text-gray-800">{selectedDate}</span>.
          </p>
          <Link
            to={`/admin/slots/create?doctorId=${selectedDoctorId}&date=${selectedDate}`}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm inline-block"
          >
            Generate Slots for this Date
          </Link>
        </div>
      ) : (
        <div>
          {/* Summary Pills */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
              Total Slots: {slots.length}
            </span>
            <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-100">
              Available: {availableSlotsCount}
            </span>
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full border border-gray-200">
              Booked: {bookedSlotsCount}
            </span>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-3.5 rounded-lg border flex items-center justify-between transition-shadow bg-white ${
                  slot.is_booked
                    ? 'border-gray-300 bg-gray-50 opacity-80'
                    : 'border-green-200 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </div>
                  <div className="mt-1">
                    {slot.is_booked ? (
                      <span className="inline-block text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Booked
                      </span>
                    ) : (
                      <span className="inline-block text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {slot.is_booked ? (
                    <span
                      title="Booked slots cannot be deleted"
                      className="text-xs text-gray-400 cursor-not-allowed px-2 py-1"
                    >
                      Locked
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDeleteSlot(slot)}
                      disabled={deletingSlotId === slot.id}
                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded transition-colors disabled:opacity-50 font-medium"
                    >
                      {deletingSlotId === slot.id ? '...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
