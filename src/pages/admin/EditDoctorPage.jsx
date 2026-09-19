import { useParams } from 'react-router-dom';

export default function EditDoctorPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Doctor</h1>
      <p className="text-gray-500 text-sm mb-4">Editing Doctor ID: {id}</p>
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 italic">
        Doctor edit form will be built in Phase 7.
      </div>
    </div>
  );
}

