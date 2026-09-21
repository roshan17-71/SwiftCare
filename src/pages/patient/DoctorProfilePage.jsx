import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorById } from '../../services/doctors';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDoctorById(id);
        if (!data) {
          throw new Error('Doctor not found.');
        }
        setDoctor(data);
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        setError(err.message || 'Failed to load doctor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-gray-500 text-sm">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-4 max-w-md mx-auto">
          <p className="font-semibold mb-2">Doctor Profile Unavailable</p>
          <p className="text-sm">{error || 'Doctor not found.'}</p>
        </div>
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
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/patient/doctors"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          ← Back to All Doctors
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden mb-8">
        {/* Banner / Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 relative"></div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-6">
            {/* Avatar */}
            {doctor.photo_url ? (
              <img
                src={doctor.photo_url}
                alt={doctor.full_name}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-blue-100 text-blue-600 border-4 border-white shadow-md flex items-center justify-center font-bold text-4xl">
                {doctor.full_name?.charAt(0) || 'D'}
              </div>
            )}

            {/* Action CTA for desktop */}
            <div className="hidden sm:block">
              {doctor.is_active ? (
                <Link
                  to={`/patient/book/${doctor.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm transition-colors text-sm inline-flex items-center gap-2"
                >
                  📅 Book Appointment
                </Link>
              ) : (
                <span className="bg-gray-100 text-gray-500 font-medium px-6 py-2.5 rounded-xl text-sm inline-block cursor-not-allowed">
                  Currently Not Available
                </span>
              )}
            </div>
          </div>

          {/* Doctor Info */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {doctor.full_name}
            </h1>
            <p className="text-base font-semibold text-blue-600 mb-2">
              {doctor.specialization}
            </p>
            {doctor.qualification && (
              <p className="text-sm text-gray-500 mb-3">
                🎓 {doctor.qualification}
              </p>
            )}

            {/* Pills */}
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {doctor.department && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  Department: {doctor.department}
                </span>
              )}
              {doctor.experience_years !== null && doctor.experience_years !== undefined && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  ⭐ {doctor.experience_years} {doctor.experience_years === 1 ? 'Year' : 'Years'} of Experience
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full ${
                  doctor.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {doctor.is_active ? 'Accepting Patients' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="sm:hidden mb-6">
            {doctor.is_active ? (
              <Link
                to={`/patient/book/${doctor.id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors text-sm text-center block"
              >
                📅 Book Appointment
              </Link>
            ) : (
              <div className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-xl text-sm text-center">
                Currently Not Available
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About the Doctor</h2>
            {doctor.about ? (
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {doctor.about}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                No bio information provided for this specialist.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
