import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/35 via-cyan-700/20 to-gray-900"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300 mb-4">About DocLink</p>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight max-w-4xl">
            Healthcare discovery and appointments, designed for speed and trust.
          </h1>
          <p className="mt-6 text-lg text-gray-200 max-w-3xl leading-relaxed">
            DocLink helps patients find reliable doctors, filter by specialty and location, and book
            appointments without waiting in long queues.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <article className="rounded-2xl border border-teal-500/30 bg-teal-900/20 p-6">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              Make healthcare access simple by connecting patients with verified doctors in minutes.
            </p>
          </article>
          <article className="rounded-2xl border border-cyan-500/30 bg-cyan-900/20 p-6">
            <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
            <p className="text-gray-300 leading-relaxed">
              A future where booking the right doctor is as smooth as ordering everyday essentials.
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-6">
            <h2 className="text-2xl font-semibold mb-3">Our Promise</h2>
            <p className="text-gray-300 leading-relaxed">
              Transparency, secure data handling, and a frictionless experience for patients and doctors.
            </p>
          </article>
        </div>
      </section>

      <section id="contact" className="py-16 bg-gray-800/40 border-y border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Contact and Social</h2>
          <p className="text-gray-300 mb-8 max-w-3xl">
            Social links are set as placeholders right now. Share your actual email and profile URLs,
            and they can be plugged in instantly.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="mailto:shreyanshcodes7475@gmail.com" className="rounded-xl border border-teal-500/30 p-4 hover:border-teal-400 transition-colors">
              <p className="text-sm text-teal-300">Email</p>
              <p className="font-semibold">shreyanshcodes7475@gmail.com</p>
            </a>
            <a href="https://www.linkedin.com/in/shreyansh7475" target="_blank" rel="noreferrer" className="rounded-xl border border-cyan-500/30 p-4 hover:border-cyan-400 transition-colors">
              <p className="text-sm text-cyan-300">LinkedIn</p>
              <p className="font-semibold">linkedin.com/in/shreyansh7475</p>
            </a>
            <a href="https://github.com/shreyanshcodes7475/" target="_blank" rel="noreferrer" className="rounded-xl border border-emerald-500/30 p-4 hover:border-emerald-400 transition-colors">
              <p className="text-sm text-emerald-300">GitHub</p>
              <p className="font-semibold">github.com/shreyanshcodes7475</p>
            </a>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">Developer of this website: <span className="font-semibold text-white">Shreyansh Gupta</span></p>
          <div className="mt-6">
            <Link
              to="/services"
              className="inline-flex px-8 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 font-semibold hover:from-teal-600 hover:to-cyan-700 transition-colors"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
