import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors, deactivateDoctor } from '../../services/doctors';

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDoctorsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDoctors();
      setDoctors(data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  const handleToggleStatus = async (doctor) => {
    const newStatus = !doctor.is_active;
    const confirmMessage = newStatus
      ? `Are you sure you want to reactivate Dr. ${doctor.full_name}?`
      : `Are you sure you want to deactivate Dr. ${doctor.full_name}? They will not appear in patient searches.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoadingId(doctor.id);
      await deactivateDoctor(doctor.id, newStatus);
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctor.id ? { ...d, is_active: newStatus } : d))
      );
    } catch (err) {
      console.error('Error toggling doctor status:', err);
      alert(err.message || 'Failed to update doctor status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Doctors</h1>
          <p className="text-gray-500 text-sm">View, add, edit, or toggle active status of doctors.</p>
        </div>
        <Link
          to="/admin/doctors/add"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
        >
          + Add Doctor
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDoctorsList}
            className="text-sm underline hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Loading doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">👨‍⚕️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Doctors Found</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Your hospital currently has no doctors added. Get started by adding your first doctor profile.
          </p>
          <Link
            to="/admin/doctors/add"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
          >
            Add Doctor
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {doc.photo_url ? (
                          <img
                            src={doc.photo_url}
                            alt={doc.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base">
                            {doc.full_name?.charAt(0) || 'D'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{doc.full_name}</p>
                          {doc.qualification && (
                            <p className="text-xs text-gray-500">{doc.qualification}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{doc.specialization}</td>
                    <td className="py-3 px-4 text-gray-600">{doc.department || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {doc.experience_years ? `${doc.experience_years} yrs` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/doctors/edit/${doc.id}`}
                          className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(doc)}
                          disabled={actionLoadingId === doc.id}
                          className={`px-3 py-1 text-xs font-semibold rounded border transition-colors disabled:opacity-50 ${
                            doc.is_active
                              ? 'text-red-600 hover:text-red-800 border-red-200 hover:border-red-300 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 border-green-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          {actionLoadingId === doc.id
                            ? 'Updating...'
                            : doc.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
