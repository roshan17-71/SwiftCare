import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import PatientLayout from './layouts/PatientLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';

// Patient pages
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import DoctorsPage from './pages/patient/DoctorsPage';
import DoctorProfilePage from './pages/patient/DoctorProfilePage';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import BookingConfirmationPage from './pages/patient/BookingConfirmationPage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import AppointmentDetailsPage from './pages/patient/AppointmentDetailsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageDoctorsPage from './pages/admin/ManageDoctorsPage';
import AddDoctorPage from './pages/admin/AddDoctorPage';
import EditDoctorPage from './pages/admin/EditDoctorPage';
import ManageSlotsPage from './pages/admin/ManageSlotsPage';
import CreateSlotsPage from './pages/admin/CreateSlotsPage';
import ManageAppointmentsPage from './pages/admin/ManageAppointmentsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute requireAdmin={false}>
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboardPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="doctors/:id" element={<DoctorProfilePage />} />
          <Route path="book/:doctorId" element={<BookAppointmentPage />} />
          <Route path="booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="appointments" element={<MyAppointmentsPage />} />
          <Route path="appointments/:id" element={<AppointmentDetailsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="doctors" element={<ManageDoctorsPage />} />
          <Route path="doctors/add" element={<AddDoctorPage />} />
          <Route path="doctors/edit/:id" element={<EditDoctorPage />} />
          <Route path="slots" element={<ManageSlotsPage />} />
          <Route path="slots/create" element={<CreateSlotsPage />} />
          <Route path="appointments" element={<ManageAppointmentsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
