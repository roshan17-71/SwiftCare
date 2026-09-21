import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
      <div className="p-5 flex-1 flex flex-col">
        {/* Doctor Header: Photo & Primary Info */}
        <div className="flex items-start gap-4 mb-3">
          {doctor.photo_url ? (
            <img
              src={doctor.photo_url}
              alt={doctor.full_name}
              className="w-16 h-16 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100 shrink-0">
              {doctor.full_name?.charAt(0) || 'D'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {doctor.full_name}
            </h3>
            <p className="text-xs font-semibold text-blue-600 mb-0.5">
              {doctor.specialization}
            </p>
            {doctor.qualification && (
              <p className="text-xs text-gray-500 truncate">
                {doctor.qualification}
              </p>
            )}
          </div>
        </div>

        {/* Badges / Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
          {doctor.department && (
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
              📍 {doctor.department}
            </span>
          )}
          {doctor.experience_years !== null && doctor.experience_years !== undefined && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              ⭐ {doctor.experience_years} {doctor.experience_years === 1 ? 'year' : 'years'} exp
            </span>
          )}
        </div>

        {/* About summary */}
        {doctor.about && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {doctor.about}
          </p>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <Link
          to={`/patient/doctors/${doctor.id}`}
          className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-2xs"
        >
          View Profile & Book
        </Link>
      </div>
    </div>
  );
}

