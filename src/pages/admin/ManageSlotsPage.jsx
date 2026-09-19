import { Link } from 'react-router-dom';

export default function ManageSlotsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Slots</h1>
          <p className="text-gray-500 text-sm">View, generate, and manage OPD appointment slots.</p>
        </div>
        <Link
          to="/admin/slots/create"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Create Slots
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 italic">
        Slot management views and calendar will be built in Phase 8.
      </div>
    </div>
  );
}

