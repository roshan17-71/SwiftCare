import { Link } from 'react-router-dom';
import { formatTime } from '../utils/time';

export default function AppointmentCard({ appointment, onCancel, isCancelling = false }) {
  const doctor = appointment.doctors;
  const slot = appointment.appointment_slots;

  const isBooked = appointment.status === 'booked';
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top: Status Badge & Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-gray-500">
            📅 {slot?.slot_date || 'Date not set'}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
              isBooked
                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                : isCompleted
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Doctor Info */}
        <div className="flex items-start gap-3 mb-4">
          {doctor?.photo_url ? (
            <img
              src={doctor.photo_url}
              alt={doctor.full_name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0 border border-blue-100">
              {doctor?.full_name?.charAt(0) || 'D'}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {doctor?.full_name || 'Doctor'}
            </h3>
            <p className="text-xs text-blue-600 font-semibold truncate">
              {doctor?.specialization || 'Specialist'}
            </p>
            {doctor?.department && (
              <p className="text-xs text-gray-500 truncate">{doctor.department}</p>
            )}
          </div>
        </div>

        {/* Time info */}
        <div className="bg-gray-50 rounded-lg p-2.5 mb-4 text-xs text-gray-700 flex items-center gap-2">
          <span>🕒</span>
          <span className="font-semibold">
            {slot?.start_time && slot?.end_time
              ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
              : 'Time not specified'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
        <Link
          to={`/patient/appointments/${appointment.id}`}
          className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          View Details
        </Link>

        {isBooked && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(appointment)}
            disabled={isCancelling}
            className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
}

