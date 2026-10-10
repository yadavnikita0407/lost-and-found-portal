import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/common/Footer'
import campusImage from '../assets/campus.jpg'

const features = [
  {
    title: 'College-restricted access',
    body: 'Registration is checked against an authorized member list, so only verified students and staff can use the portal.',
  },
  {
    title: 'Lost & found reporting',
    body: 'File reports with photos, category, location, colour, brand, and other details that make an item easy to identify.',
  },
  {
    title: 'Smart match suggestions',
    body: 'New reports are compared automatically by name, category, colour, brand, and location so likely pairs surface early.',
  },
  {
    title: 'Ownership claims',
    body: 'Submit a claim with your reason. Admins review and verify before any handover takes place.',
  },
  {
    title: 'Notifications',
    body: 'Get updates when a report is approved, a match is suggested, a claim changes status, or an item is returned.',
  },
  {
    title: 'Admin oversight',
    body: 'Admins manage reports, claims, and users, view portal statistics, and keep an audit trail of key actions.',
  },
]

const lostSteps = [
  'Sign in with your college account',
  'Report the lost item with details and a photo',
  'Review match suggestions from found reports',
  'Submit an ownership claim',
  'Wait for admin verification, then collect the item',
]

const foundSteps = [
  'Sign in with your college account',
  'Report the found item with where and when',
  'The system suggests possible lost-item matches',
  'The owner submits a claim for review',
  'Admin verifies and marks the item returned',
]

function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return undefined

    const nodes = root.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return ref
}

export default function Home() {
  const pageRef = useReveal()

  return (
    <div ref={pageRef} className="min-h-screen bg-paper">
      <header className="relative min-h-[100svh] overflow-hidden text-white">
        <img
          src={campusImage}
          alt="College campus building"
          className="hero-image absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-bark/62" aria-hidden="true" />

        <nav className="relative z-10 mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <a
            href="#top"
            className="font-display text-lg font-medium tracking-tight text-white"
          >
            Lost &amp; Found
          </a>
          <div className="flex items-center gap-5 text-sm font-medium">
            <a
              href="#features"
              className="hidden text-white/80 transition-colors hover:text-white sm:inline"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden text-white/80 transition-colors hover:text-white sm:inline"
            >
              How it works
            </a>
            <Link
              to="/login"
              className="text-white/85 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="border border-white/80 bg-white px-3.5 py-1.5 text-bark transition-colors hover:bg-paper"
            >
              Register
            </Link>
          </div>
        </nav>

        <div
          id="top"
          className="hero-copy relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-5xl flex-col justify-end px-6 pb-16 pt-24 sm:pb-20 sm:pt-28"
        >
          <p className="font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Lost &amp; Found
          </p>
          <h1 className="mt-5 max-w-xl text-xl font-medium leading-snug text-white/95 sm:text-2xl">
            One place on campus to report, match, and recover belongings.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            Built for authorized college members — quieter than group chats,
            clearer than notice boards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="bg-lake px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lake-deep"
            >
              Create account
            </Link>
            <a
              href="#how-it-works"
              className="border border-white/70 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See how it works
            </a>
          </div>
        </div>
      </header>

      <main>
        <section
          id="features"
          className="border-b border-rule bg-surface"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <div className="reveal max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lake-deep">
                Features
              </p>
              <h2
                id="features-heading"
                className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
              >
                Everything the portal covers
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-quiet">
                From verified signup to admin-approved returns — the tools needed
                to keep lost property organised and accountable.
              </p>
            </div>

            <ul className="mt-14 divide-y divide-rule border-y border-rule">
              {features.map((feature, index) => (
                <li
                  key={feature.title}
                  className="reveal grid gap-3 py-7 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-10"
                  style={{ transitionDelay: `${index * 45}ms` }}
                >
                  <h3 className="font-display text-lg font-medium tracking-tight text-ink">
                    {feature.title}
                  </h3>
                  <p className="max-w-2xl text-base leading-relaxed text-quiet">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-paper"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <div className="reveal max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lake-deep">
                How it works
              </p>
              <h2
                id="how-heading"
                className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
              >
                Two paths. One clear process.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-quiet">
                Whether you lost something or found something, the steps stay
                simple — and every return is verified.
              </p>
            </div>

            <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="reveal">
                <h3 className="border-b border-rule pb-4 font-display text-2xl font-medium tracking-tight text-ink">
                  If you lost an item
                </h3>
                <ol className="mt-6 space-y-5">
                  {lostSteps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span
                        className="font-display w-7 shrink-0 text-lg font-medium text-lake-deep"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="pt-0.5 text-base leading-relaxed text-ink">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="reveal" style={{ transitionDelay: '80ms' }}>
                <h3 className="border-b border-rule pb-4 font-display text-2xl font-medium tracking-tight text-ink">
                  If you found an item
                </h3>
                <ol className="mt-6 space-y-5">
                  {foundSteps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span
                        className="font-display w-7 shrink-0 text-lg font-medium text-lake-deep"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="pt-0.5 text-base leading-relaxed text-ink">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="reveal mt-16 flex flex-col gap-4 border-t border-rule pt-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-base leading-relaxed text-quiet">
                Ready to report or search? Sign in with your college credentials
                to get started.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="bg-bark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="border border-bark px-5 py-2.5 text-sm font-semibold text-bark transition-colors hover:bg-bark hover:text-white"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
