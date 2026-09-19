export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Brand */}
        <div>
          <h3 className="text-white font-bold text-lg mb-2">🏥 SwiftCare</h3>
          <p className="text-sm">Making healthcare appointments simple, fast, and stress-free.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-2">Quick Links</h4>
          <ul className="text-sm space-y-1">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/login" className="hover:text-white">Login</a></li>
            <li><a href="/register" className="hover:text-white">Register</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-2">Contact Us</h4>
          <ul className="text-sm space-y-1">
            <li>📍 123 Health Street, Medical City</li>
            <li>📞 +1 (800) 555-0199</li>
            <li>✉️ info@swiftcare.health</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 text-center py-3 text-xs text-gray-500">
        © {new Date().getFullYear()} SwiftCare. All rights reserved.
      </div>
    </footer>
  );
}

