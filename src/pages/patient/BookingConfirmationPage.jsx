import { useLocation, Link } from 'react-router-dom';
import { formatTime } from '../../utils/time';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const { doctor, slot, appointment } = location.state || {};

  return (
    <div className="max-w-xl mx-auto py-8 px-4 text-center">
      {/* Celebration Checkmark */}
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xs border border-green-200">
        ✓
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Appointment Confirmed!
      </h1>
      <p className="text-gray-600 text-sm mb-8 max-w-md mx-auto">
        Your OPD consultation slot has been booked and reserved. Please review your appointment summary below.
      </p>

      {/* Appointment Summary Box */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 text-left mb-8 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Booking Status
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
            ● Confirmed & Booked
          </span>
        </div>

        {doctor && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Doctor:</span>
            <span className="text-sm font-bold text-gray-800">{doctor.full_name}</span>
          </div>
        )}

        {doctor?.specialization && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Specialization:</span>
            <span className="text-sm font-semibold text-blue-600">{doctor.specialization}</span>
          </div>
        )}

        {slot?.slot_date && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm font-semibold text-gray-800">{slot.slot_date}</span>
          </div>
        )}

        {slot?.start_time && slot?.end_time && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Consultation Time:</span>
            <span className="text-sm font-bold text-gray-900">
              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
            </span>
          </div>
        )}

        {appointment?.appointment_id && (
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-400">Appointment Ref:</span>
            <span className="text-xs font-mono text-gray-600 truncate max-w-[200px]">
              {appointment.appointment_id}
            </span>
          </div>
        )}
      </div>

      {/* Hospital Visit Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 text-left mb-8 flex items-start gap-3">
        <span className="text-base">ℹ️</span>
        <div>
          <p className="font-semibold mb-0.5">Visiting the Hospital</p>
          <p className="text-blue-700/90 leading-relaxed">
            Please arrive at the OPD reception at least 10–15 minutes before your scheduled slot time with any prior medical records.
          </p>
        </div>
      </div>

      {/* Action Links */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/patient/appointments"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-xs transition-colors text-sm"
        >
          View My Appointments
        </Link>
        <Link
          to="/patient/doctors"
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Browse More Doctors
        </Link>
        <Link
          to="/patient/dashboard"
          className="text-gray-500 hover:text-gray-700 font-medium px-4 py-3 text-sm"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
