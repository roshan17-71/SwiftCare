import { Link } from 'react-router-dom';

export default function ManageDoctorsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Doctors</h1>
          <p className="text-gray-500 text-sm">View, add, edit, or deactivate doctors.</p>
        </div>
        <Link
          to="/admin/doctors/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Add Doctor
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 italic">
        Doctor management table and actions will be built in Phase 7.
      </div>
    </div>
  );
}

