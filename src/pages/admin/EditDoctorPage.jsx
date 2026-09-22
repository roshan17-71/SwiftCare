import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDoctorById, updateDoctor, uploadDoctorPhoto } from '../../services/doctors';

export default function EditDoctorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    qualification: '',
    department: '',
    experience_years: '',
    about: '',
    is_active: true,
  });

  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setPageLoading(true);
        setError(null);
        const doc = await getDoctorById(id);
        if (!doc) {
          throw new Error('Doctor not found.');
        }

        setFormData({
          full_name: doc.full_name || '',
          specialization: doc.specialization || '',
          qualification: doc.qualification || '',
          department: doc.department || '',
          experience_years: doc.experience_years !== null ? doc.experience_years.toString() : '',
          about: doc.about || '',
          is_active: doc.is_active ?? true,
        });

        if (doc.photo_url) {
          setExistingPhotoUrl(doc.photo_url);
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError(err.message || 'Failed to load doctor profile.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, JPEG, etc.).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be under 5MB.');
        return;
      }
      setError(null);
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const expYears = formData.experience_years ? parseInt(formData.experience_years, 10) : null;
    if (expYears !== null && (isNaN(expYears) || expYears < 0 || expYears > 70)) {
      setError('Experience must be a realistic number between 0 and 70 years.');
      return;
    }

    setSaveLoading(true);

    try {
      let photoUrl = existingPhotoUrl;

      // 1. Upload new photo if user selected one
      if (photoFile) {
        photoUrl = await uploadDoctorPhoto(photoFile);
      }

      // 2. Update doctor in Supabase
      await updateDoctor(id, {
        full_name: formData.full_name.trim(),
        specialization: formData.specialization.trim(),
        qualification: formData.qualification ? formData.qualification.trim() : null,
        department: formData.department ? formData.department.trim() : null,
        experience_years: expYears,
        about: formData.about ? formData.about.trim() : null,
        photo_url: photoUrl,
        is_active: formData.is_active,
      });

      navigate('/admin/doctors');
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err.message || 'Failed to update doctor profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-gray-500 text-sm">Loading doctor details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/admin/doctors"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2"
        >
          ← Back to Doctors
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Doctor Profile</h1>
        <p className="text-gray-500 text-sm">Update specialist information and availability.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            required
            placeholder="e.g. Dr. Sarah Jenkins"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Specialization & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Specialization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="specialization"
              required
              placeholder="e.g. Cardiologist"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              placeholder="e.g. Cardiology"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Qualification & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              placeholder="e.g. MBBS, MD (Cardiology)"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              name="experience_years"
              min="0"
              placeholder="e.g. 12"
              value={formData.experience_years}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Doctor Profile Photo
          </label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="New Preview"
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            ) : existingPhotoUrl ? (
              <img
                src={existingPhotoUrl}
                alt="Current"
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                No Photo
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to keep existing photo.</p>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            About Doctor
          </label>
          <textarea
            name="about"
            rows="3"
            placeholder="Brief bio, clinical interests, or background..."
            value={formData.about}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Active Status Toggle */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
            Doctor is Active (visible to patients for appointments)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/admin/doctors"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {saveLoading ? 'Updating Doctor...' : 'Update Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}
