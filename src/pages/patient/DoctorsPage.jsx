import { useState, useEffect, useMemo } from 'react';
import { getActiveDoctors } from '../../services/doctors';
import DoctorCard from '../../components/DoctorCard';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveDoctors();
      setDoctors(data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Extract distinct specializations for the filter dropdown
  const specializations = useMemo(() => {
    const specs = doctors
      .map((d) => d.specialization)
      .filter((s) => Boolean(s));
    return ['All', ...Array.from(new Set(specs)).sort()];
  }, [doctors]);

  // Client-side filtering
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        searchTerm === '' ||
        doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpec =
        selectedSpecialization === 'All' ||
        doc.specialization === selectedSpecialization;

      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  return (
    <div>
      {/* Title & Introduction */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
        <p className="text-gray-600">
          Browse our team of qualified specialists and schedule your OPD consultation.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by doctor name, specialization, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Specialization Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec === 'All' ? 'All Specializations' : spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDoctors}
            className="text-sm underline hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Finding specialists...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-16 text-center">
          <div className="text-4xl mb-3">🏥</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No Active Doctors Found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            There are currently no active doctors available for booking. Please check back soon or contact the hospital.
          </p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No Matching Doctors</h3>
          <p className="text-gray-500 text-sm mb-4">
            We couldn't find any doctor matching your search criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('All');
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
