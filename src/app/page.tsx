"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Inter } from "next/font/google";
import {
  Droplet,
  Heart,
  ShieldCheck,
  Search,
  MapPin,
  Menu,
  X,
  PhoneCall,
  Activity,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  Globe,
  Users
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      setContactStatus("Please fill in all fields.");
      return;
    }
    setContactSubmitting(true);
    setContactStatus(null);
    
    // Simulate inquiry submission with a delay
    setTimeout(() => {
      setContactSubmitting(false);
      setContactStatus("Thank you! Your message has been sent successfully.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 1000);
  };

  // Handle scroll for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-[#F9FAFB] text-[#111827] ${inter.className}`}>
      
      {/* 1. STICKY NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-sm py-3" : "bg-white/80 backdrop-blur-md py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-[#FEE2E2] p-2 rounded-lg">
              <Droplet className="text-[#DC2626]" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111827]">
              red<span className="text-[#DC2626]">hope</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#" className="text-[#DC2626] transition-colors">Home</a>
            <a href="#live-map" className="text-gray-600 hover:text-[#DC2626] transition-colors">Find Donor</a>
            <a href="#about" className="text-gray-600 hover:text-[#DC2626] transition-colors">About</a>
            <a href="#contact" className="text-gray-600 hover:text-[#DC2626] transition-colors">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="text-gray-600 hover:text-[#111827] font-medium text-sm transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="bg-[#DC2626] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm shadow-red-200"
            >
              Register
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
                <a href="#" className="block py-2 text-[#DC2626] font-medium">Home</a>
                <a href="#live-map" className="block py-2 text-gray-600 font-medium">Find Donor</a>
                <a href="#about" className="block py-2 text-gray-600 font-medium">About</a>
                <a href="#contact" className="block py-2 text-gray-600 font-medium">Contact</a>
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                  <button onClick={() => router.push("/login")} className="w-full py-2.5 text-center text-gray-700 font-medium border border-gray-200 rounded-lg">Login</button>
                  <button onClick={() => router.push("/signup")} className="w-full py-2.5 text-center bg-[#DC2626] text-white font-medium rounded-lg">Register</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden relative bg-white">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FEE2E2]/30 rounded-bl-[100px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <motion.div 
              className="flex-1 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#DC2626] text-sm font-semibold mb-6">
                <Activity size={16} />
                <span>Urgent Emergency Response</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#111827] leading-tight mb-6">
                Find Blood Donors <br className="hidden md:block" />
                <span className="text-[#DC2626]">Near You Instantly</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Connect directly with willing donors in your area. Our platform bridges the gap between those in need and those who can save a life, especially during critical emergencies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => router.push("/campaigns")}
                  className="bg-[#DC2626] hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 group"
                >
                  <Search size={18} />
                  Find a Donor
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="bg-white hover:bg-gray-50 text-[#111827] border border-gray-200 px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Heart size={18} className="text-[#DC2626]" />
                  Become a Donor
                </button>
              </div>
              
              <div className="mt-10 flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=f3f4f6`} alt="avatar" />
                    </div>
                  ))}
                </div>
                <p>Join 10,000+ registered donors today.</p>
              </div>
            </motion.div>
            
            {/* Right Image */}
            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100 p-2">
                <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] flex items-center justify-center relative">
                  {/* Realistic placeholder representation of a healthcare scene */}
                  <img 
                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200&auto=format&fit=crop" 
                    alt="Healthcare Professional with Blood Bag" 
                    className="w-full h-full object-cover"
                  />
                  {/* Floating Elements to simulate UI context */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -left-6 top-10 bg-white p-4 rounded-xl shadow-lg border border-gray-50 flex items-center gap-4"
                  >
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Match Found</p>
                      <p className="text-xs text-gray-500">O+ Blood Type</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 3. STATISTICS SECTION */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon={<Heart />} value="500+" label="Active Donors" />
            <StatCard icon={<CheckCircle2 />} value="1,200+" label="Requests Completed" />
            <StatCard icon={<Clock />} value="24/7" label="Emergency Support" />
            <StatCard icon={<Activity />} value="50+" label="Hospitals Connected" />
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="about" className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">Why Choose redhope?</h2>
            <p className="text-gray-600">We provide a secure, fast, and reliable platform to ensure that blood reaches those who need it without unnecessary delays.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Search size={28} className="text-[#DC2626]" />}
              title="Live Donor Search"
              desc="Search for active blood donors in your city in real-time with our advanced matching system."
            />
            <FeatureCard 
              icon={<Activity size={28} className="text-[#DC2626]" />}
              title="Emergency Requests"
              desc="Broadcast urgent blood requirements instantly to compatible donors nearby."
            />
            <FeatureCard 
              icon={<MapPin size={28} className="text-[#DC2626]" />}
              title="Nearby Matching"
              desc="Our geolocation technology connects you with donors who are closest to your hospital."
            />
            <FeatureCard 
              icon={<ShieldCheck size={28} className="text-[#DC2626]" />}
              title="Verified Profiles"
              desc="All users undergo a strict verification process to ensure a safe and trustworthy community."
            />
          </div>
        </div>
      </section>

      {/* 4.5 UN SUSTAINABLE DEVELOPMENT GOALS (SDGs) SECTION */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-gray-100">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-50/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -right-40 top-0 w-96 h-96 bg-blue-50/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#DC2626] text-sm font-semibold mb-4 border border-red-100">
              <Globe size={16} />
              <span>UN Sustainable Development Goals (SDGs) Alignment</span>
            </div>
            <h2 className="text-3.5xl md:text-4xl font-extrabold text-[#111827] tracking-tight mb-6">
              Our Vision for Social Impact
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              redhope is designed not just as a software platform, but as a catalyst for global good. We are actively aligned with the United Nations Sustainable Development Goals to ensure equal healthcare, reduced disparities, and strong institutional partnerships.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <SDGCard 
              goalNumber="3"
              title="Good Health and Well-Being"
              desc="Ensuring healthy lives and promoting well-being for all at all ages. redhope directly combats emergency healthcare delays by bridging critical gaps in blood supply chain visibility, preventing preventable loss of lives."
              icon={<Heart size={24} />}
              badgeColor="bg-emerald-50 border-emerald-200 text-emerald-700"
              iconBgColor="bg-emerald-50/50 border-emerald-100"
              textColor="text-emerald-600"
              borderColor="hover:border-emerald-200 border-gray-100"
            />
            <SDGCard 
              goalNumber="10"
              title="Reduced Inequalities"
              desc="Equal and free access to life-saving resources. redhope democratizes medical access, ensuring that rare blood groups and immediate dispatches are equally accessible to everyone, irrespective of social standing."
              icon={<Users size={24} />}
              badgeColor="bg-pink-50 border-pink-200 text-pink-700"
              iconBgColor="bg-pink-50/50 border-pink-100"
              textColor="text-pink-600"
              borderColor="hover:border-pink-200 border-gray-100"
            />
            <SDGCard 
              goalNumber="17"
              title="Partnerships for the Goals"
              desc="Uniting donors, healthcare institutes, and volunteers. redhope builds cohesive networks between local communities, public blood banks, and hospitals to build a resilient and collaborative support ecosystem."
              icon={<ShieldCheck size={24} />}
              badgeColor="bg-blue-50 border-blue-200 text-blue-700"
              iconBgColor="bg-blue-50/50 border-blue-100"
              textColor="text-blue-600"
              borderColor="hover:border-blue-200 border-gray-100"
            />
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#111827] mb-4">How It Works</h2>
            <p className="text-gray-600">A simple, three-step process designed to save lives quickly and efficiently.</p>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-10 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-100 z-0"></div>
            
            <StepCard 
              number="1"
              title="Register Account"
              desc="Sign up securely as a donor or a patient needing blood using your phone number."
            />
            <StepCard 
              number="2"
              title="Search or Request"
              desc="Post an emergency request or search our database for matching donors."
            />
            <StepCard 
              number="3"
              title="Connect & Donate"
              desc="Contact the donor directly through our platform and arrange the donation."
            />
          </div>
        </div>
      </section>

      {/* 6. MEET THE TEAM SECTION */}
      <section className="py-24 bg-[#F9FAFB] border-t border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-50/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-100 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#DC2626] text-sm font-semibold mb-4 border border-red-100">
              <Users size={16} />
              <span>Project Creators</span>
            </div>
            <h2 className="text-3.5xl md:text-4xl font-extrabold text-[#111827] tracking-tight mb-4">
              Meet the Team
            </h2>
            <p className="text-gray-600 leading-relaxed">
              The creative minds and developers behind redhope, dedicated to building responsive healthcare utilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <TeamCard 
              name="Deevansh Rana"
              role="Lead Developer & Lead Designer"
              studentId="Roll No: 2411981181"
              desc="Designed the core Next.js frontend, engineered custom interactive location widgets, and coordinated full-stack authentication modules."
              imageSrc="/images/deevansh.jpg"
            />
            <TeamCard 
              name="Eshaan Puri"
              role="Backend & Systems Specialist"
              studentId="Roll No: 2411981208"
              desc="Configured robust Prisma SQLite relational schemas, secured critical middleware routes, and managed SMS/email notification dispatches."
              imageSrc="/images/eshaan.png"
            />
          </div>
        </div>
      </section>

      {/* 6.5 PREMIUM CONTACT US SECTION */}
      <section id="contact" className="py-24 bg-white border-t border-gray-100 relative overflow-hidden">
        {/* Subtle Background Decorative Blobs */}
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#FEE2E2]/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -left-40 bottom-0 w-80 h-80 bg-red-50/30 rounded-full blur-2xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEE2E2] text-[#DC2626] text-sm font-semibold mb-4">
              <Mail size={16} />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3.5xl font-extrabold text-[#111827] tracking-tight mb-4">
              Have Questions? Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our team is ready to assist you. Drop us a message, email us directly, or call our emergency hotline.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            {/* Left side: Contact Info Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-100 flex items-start gap-5 hover:shadow-md transition-all group">
                <div className="bg-[#FEE2E2] p-4 rounded-xl text-[#DC2626] group-hover:scale-110 transition-transform">
                  <PhoneCall size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1.5 text-base">Call Us Anytime</h4>
                  <p className="text-gray-500 text-sm mb-2.5">Available 24/7 for urgent donor requirements.</p>
                  <a href="tel:18001234567" className="text-[#DC2626] font-bold text-lg hover:underline transition-all">
                    1800-123-4567
                  </a>
                </div>
              </div>

              <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-100 flex items-start gap-5 hover:shadow-md transition-all group">
                <div className="bg-red-50 p-4 rounded-xl text-[#DC2626] group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1.5 text-base">Email Support</h4>
                  <p className="text-gray-500 text-sm mb-2.5">Send us your queries, feedback, or partnerships.</p>
                  <a href="mailto:support@redhope.org" className="text-[#DC2626] font-bold text-lg hover:underline transition-all">
                    support@redhope.org
                  </a>
                </div>
              </div>

              <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-100 flex items-start gap-5 hover:shadow-md transition-all group">
                <div className="bg-red-50 p-4 rounded-xl text-[#DC2626] group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1.5 text-base">Our Location</h4>
                  <p className="text-gray-500 text-sm mb-2.5">Main Headquarters & Blood Coordination Hub.</p>
                  <span className="text-gray-800 font-semibold text-sm">
                    New Delhi, India
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Glassmorphism Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    How can we help?
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Enter your message or inquiry here..."
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] transition-all text-sm resize-none"
                    required
                  ></textarea>
                </div>

                {contactStatus && (
                  <p
                    className={`text-sm font-semibold ${
                      contactStatus.includes("successfully") ? "text-green-600" : "text-[#DC2626]"
                    }`}
                  >
                    {contactStatus}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full bg-[#DC2626] hover:bg-red-700 disabled:opacity-75 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-200 active:scale-[0.99] flex items-center justify-center gap-2 group"
                >
                  {contactSubmitting ? (
                    "Sending Message..."
                  ) : (
                    <>
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#FEE2E2] p-2 rounded-lg">
                  <Droplet className="text-[#DC2626]" size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight text-[#111827]">
                  red<span className="text-[#DC2626]">hope</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Connecting lives, one drop at a time. A modern platform dedicated to solving blood emergencies across the country.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#111827] mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#live-map" className="hover:text-[#DC2626] transition-colors">Find a Donor</a></li>
                <li><a href="#about" className="hover:text-[#DC2626] transition-colors">About Us</a></li>
                <li><a href="#live-map" className="hover:text-[#DC2626] transition-colors">Partner Hospitals</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#111827] mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#DC2626] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#DC2626] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#DC2626] transition-colors">Donor Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#111827] mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-center gap-2"><PhoneCall size={16} /> 1800-123-4567</li>
                <li className="flex items-center gap-2"><MapPin size={16} /> New Delhi, India</li>
                <li>support@redhope.org</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} redhope. All rights reserved.
            </p>
            <div className="flex gap-4 text-gray-400">
              {/* Dummy Social Icons */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                <span className="text-xs font-bold">FB</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                <span className="text-xs font-bold">X</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                <span className="text-xs font-bold">IG</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="text-[#DC2626] mb-3 bg-[#FEE2E2] p-3 rounded-full">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
      </div>
      <h3 className="text-2xl font-extrabold text-[#111827] mb-1">{value}</h3>
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="bg-[#FEE2E2] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#111827] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex-1 flex flex-col items-center text-center z-10 relative">
      <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#DC2626] shadow-sm flex items-center justify-center text-2xl font-bold text-[#DC2626] mb-6">
        {number}
      </div>
      <h3 className="text-xl font-bold text-[#111827] mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{desc}</p>
    </div>
  );
}



function SDGCard({ goalNumber, title, desc, icon, badgeColor, iconBgColor, textColor, borderColor }: {
  goalNumber: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  badgeColor: string;
  iconBgColor: string;
  textColor: string;
  borderColor: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      className={`bg-white p-8 rounded-3xl border-2 ${borderColor} shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent rounded-full -mr-6 -mt-6"></div>
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-full border ${badgeColor}`}>
            Goal {goalNumber}
          </span>
          <div className={`p-3 rounded-2xl ${iconBgColor} ${textColor} border`}>
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-[#111827] mb-3 leading-snug">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
        <span>Sustainable Development</span>
        <span className={textColor}>UN SDG</span>
      </div>
    </motion.div>
  );
}

function TeamCard({ name, role, studentId, desc, imageSrc }: {
  name: string;
  role: string;
  studentId: string;
  desc: string;
  imageSrc: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6"
    >
      <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner border border-gray-100 relative group">
        <img 
          src={imageSrc} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="flex-1 text-center md:text-left space-y-2">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#DC2626] uppercase">{role}</span>
          <h3 className="text-xl font-bold text-[#111827] mt-0.5">{name}</h3>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">{studentId}</p>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
