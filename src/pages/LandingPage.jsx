import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const departments = [
  { icon: '🫀', name: 'Cardiology' },
  { icon: '🧠', name: 'Neurology' },
  { icon: '🦴', name: 'Orthopedics' },
  { icon: '👁️', name: 'Ophthalmology' },
  { icon: '🌿', name: 'General Medicine' },
  { icon: '🤰', name: 'Gynecology' },
  { icon: '👶', name: 'Pediatrics' },
  { icon: '🦷', name: 'Dental' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Your Health, Our Priority
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Book OPD appointments with our specialist doctors in seconds.
            No waiting in queues — just simple, fast scheduling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 text-lg shadow"
            >
              Book Appointment
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">About SwiftCare Hospital</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            SwiftCare Hospital has been serving our community for over 25 years with
            compassionate, world-class medical care. Our team of 50+ specialist doctors
            is dedicated to your well-being across all major medical departments.
            We believe every patient deserves timely, quality healthcare — and SwiftCare
            makes booking your OPD visit easier than ever.
          </p>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+', label: 'Specialist Doctors' },
            { value: '25+', label: 'Years of Service' },
            { value: '10k+', label: 'Patients Served' },
            { value: '8', label: 'Departments' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Our Departments</h2>
          <p className="text-gray-500 text-center mb-10">
            Expert care across all major medical specializations.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <span className="text-4xl mb-2">{dept.icon}</span>
                <span className="text-gray-700 font-medium text-sm text-center">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 text-white py-14 px-4 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to Book Your Appointment?</h2>
        <p className="text-blue-100 mb-6 text-lg">
          Create a free account and book an OPD slot in under 2 minutes.
        </p>
        <Link
          to="/register"
          className="bg-white text-blue-700 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 text-lg shadow"
        >
          Get Started — It's Free
        </Link>
      </section>

      <Footer />
    </div>
  );
}

