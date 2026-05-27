import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#0f0f0f] text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Column 1 — Brand Info */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🩸</span>
            </div>
            <h2 className="text-white text-xl font-semibold">redhope</h2>
          </div>

          <p className="text-sm leading-relaxed mb-6">
            India&apos;s leading real-time blood donation platform connecting
            donors, hospitals, and NGOs to save lives.
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail size={16} /> contact@redhope.com
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} /> +91 1800-redhope
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} /> New Delhi, India
            </div>
          </div>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-white font-semibold mb-4">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">How It Works</li>
            <li className="hover:text-white cursor-pointer">Features</li>
            <li className="hover:text-white cursor-pointer">For Donors</li>
            <li className="hover:text-white cursor-pointer">For Hospitals</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Blog</li>
            <li className="hover:text-white cursor-pointer">FAQs</li>
            <li className="hover:text-white cursor-pointer">
              Blood Types Guide
            </li>
            <li className="hover:text-white cursor-pointer">Donation Tips</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Press</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">
              Terms of Service
            </li>
            <li className="hover:text-white cursor-pointer">Cookie Policy</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-12 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>© 2026 redhope. All rights reserved. Made with ❤️ to save lives.</p>

        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="hover:text-white cursor-pointer">Privacy</span>
          <span className="hover:text-white cursor-pointer">Terms</span>
          <span className="hover:text-white cursor-pointer">Accessibility</span>
        </div>
      </div>
    </footer>
  );
}
