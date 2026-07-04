import { Link } from 'react-router-dom'

const services = [
  {
    title: 'Doctor Discovery',
    description:
      'Find doctors by specialty, location, and profile quality before making a booking decision.',
    icon: '🔎',
    accent: 'from-teal-500/20 to-cyan-500/20 border-teal-500/40',
  },
  {
    title: 'Instant Appointment Booking',
    description:
      'Book in a few clicks with reduced wait time and a clean, guided flow for patients.',
    icon: '📅',
    accent: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40',
  },
  {
    title: 'Location Based Search',
    description:
      'Choose your city and see relevant doctors near you to improve convenience and speed.',
    icon: '📍',
    accent: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40',
  },
  {
    title: 'Patient Dashboard',
    description:
      'Manage appointments and account information from a single, easy to use dashboard.',
    icon: '🧾',
    accent: 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/40',
  },
  {
    title: 'Doctor Dashboard',
    description:
      'Doctors can update profiles, review details, and manage their booking-facing information.',
    icon: '🩺',
    accent: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
  },
  {
    title: 'Admin Controls',
    description:
      'Secure admin access for platform-level management and visibility across operations.',
    icon: '🛡️',
    accent: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/40',
  },
]

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.22),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,0.18),transparent_40%)]"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Services</p>
          <h1 className="mt-4 text-4xl sm:text-6xl font-bold">Everything You Need To Manage Care</h1>
          <p className="mt-6 max-w-3xl mx-auto text-gray-300 text-lg">
            These services are built for patients, doctors, and administrators so each user gets a
            focused workflow.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <article
              key={service.title}
              className={`rounded-2xl border bg-gradient-to-br p-6 ${service.accent} hover:translate-y-[-4px] transition-transform`}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h2 className="text-2xl font-semibold mb-3">{service.title}</h2>
              <p className="text-gray-300 leading-relaxed">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-14 border-t border-gray-700 bg-gray-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300 mb-6">Need social links in footer or contact cards? Share them and they can be added quickly.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/about#contact"
              className="px-7 py-3 rounded-lg border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            >
              Contact Details
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 font-semibold hover:from-teal-600 hover:to-cyan-700 transition-colors"
            >
              Login To Start
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
