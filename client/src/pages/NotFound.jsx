import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <div className="border border-rule bg-surface p-10 sm:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-lake-deep">
              Error 404 &bull; Missing Entry
            </span>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
              Record Not Found
            </h1>
            <p className="mt-4 text-xs leading-relaxed text-quiet">
              The requested address or record could not be located in the campus repository. It may have been relocated, archived after claim settlement, or input erroneously.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="bg-bark px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-surface transition-colors hover:bg-lake-deep"
              >
                Return to Dashboard
              </Link>
              <Link
                to="/items"
                className="border border-rule bg-surface px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-bark transition-colors hover:bg-paper"
              >
                Browse Registry
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
