import { useState, useEffect, useMemo } from 'react';
import { getAllAppointments, markCompleted } from '../../services/appointments';
import { formatTime } from '../../utils/time';

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAppointments();
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching admin appointments:', err);
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Distinct doctors list for filtering
  const doctorsList = useMemo(() => {
    const map = new Map();
    appointments.forEach((app) => {
      if (app.doctors?.id && !map.has(app.doctors.id)) {
        map.set(app.doctors.id, app.doctors.full_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // Status
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }
      // Doctor
      if (doctorFilter !== 'all' && app.doctor_id !== doctorFilter) {
        return false;
      }
      // Date
      if (dateFilter && app.appointment_slots?.slot_date !== dateFilter) {
        return false;
      }
      return true;
    });
  }, [appointments, statusFilter, doctorFilter, dateFilter]);

  const handleMarkCompleted = async (appointment) => {
    const confirmMessage = `Mark appointment for patient "${
      appointment.profiles?.full_name || 'Patient'
    }" with Dr. ${appointment.doctors?.full_name || 'Doctor'} as COMPLETED?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdatingId(appointment.id);
      await markCompleted(appointment.id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointment.id ? { ...a, status: 'completed' } : a))
      );
    } catch (err) {
      console.error('Error marking appointment completed:', err);
      alert(err.message || 'Failed to update appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Appointments</h1>
        <p className="text-gray-500 text-sm">
          Overview of all patient bookings across departments with status controls.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Doctor Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Doctor
          </label>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="all">All Doctors</option>
            {doctorsList.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Filter Date
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                title="Clear date"
              >
                Clear
              </button>
            )}
          </div>
        </div>
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

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Loading all appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Appointments Found</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {appointments.length === 0
              ? 'No patient appointments have been booked yet in the hospital.'
              : 'No appointments match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Phone No.</th>
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Consultation Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((app) => {
                  const slot = app.appointment_slots;
                  const isBooked = app.status === 'booked';
                  const isCompleted = app.status === 'completed';
                  const isCancelled = app.status === 'cancelled';

                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">
                          {app.profiles?.full_name || 'Patient'}
                        </p>
                      </td>

                      {/* Phone No. */}
                      <td className="py-3.5 px-4 text-gray-700">
                        {app.profiles?.phone ? (
                          <span className="font-medium text-gray-800">
                            📞 {app.profiles.phone}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">
                          {app.doctors?.full_name || 'Doctor'}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          {app.doctors?.specialization || '—'}
                        </p>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4">
                        <p className="text-gray-900 font-medium">
                          📅 {slot?.slot_date || '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          🕒{' '}
                          {slot?.start_time && slot?.end_time
                            ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                            : '—'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            isBooked
                              ? 'bg-blue-100 text-blue-800'
                              : isCompleted
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          ● {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isBooked ? (
                          <button
                            onClick={() => handleMarkCompleted(app)}
                            disabled={updatingId === app.id}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                          >
                            {updatingId === app.id ? 'Updating...' : 'Mark Completed'}
                          </button>
                        ) : isCompleted ? (
                          <span className="text-xs font-semibold text-green-700">
                            Completed ✓
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
