import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchItems } from '../api/itemsApi'
import { getMyClaims } from '../api/claimsApi'
import { getNotifications } from '../api/notificationsApi'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ItemGrid from '../components/items/ItemGrid'
import { ITEM_CATEGORIES, ITEM_TYPES } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

function SearchIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 pointer-events-none ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function PlusIcon({ className = '' }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function ShieldCheckIcon({ className = '' }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter state for recent items
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Load dashboard data
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        const [itemsRes, claimsRes, notifsRes] = await Promise.all([
          fetchItems({ limit: 12 }),
          getMyClaims(),
          getNotifications(),
        ])

        if (isMounted) {
          setItems(itemsRes.data || [])
          setClaims(claimsRes.data || [])
          setNotifications(notifsRes.data || [])
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  // Filter items in memory
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchName = item.name?.toLowerCase().includes(query)
        const matchDesc = item.description?.toLowerCase().includes(query)
        const matchLoc = item.location?.toLowerCase().includes(query)
        const matchBrand = item.brand?.toLowerCase().includes(query)
        if (!matchName && !matchDesc && !matchLoc && !matchBrand) return false
      }
      return true
    })
  }, [items, typeFilter, selectedCategory, searchQuery])

  // Filter user's own reports from items list
  const myReports = useMemo(() => {
    if (!user?._id) return []
    return items.filter((i) => {
      const reporterId = typeof i.reporterId === 'object' ? i.reporterId?._id : i.reporterId
      return String(reporterId) === String(user._id)
    })
  }, [items, user])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* ── Top Navigation ────────────────────────────────────────────────── */}
      <Navbar />

      <main className="flex-1">
        {/* ── Dashboard Hero & Identification Banner ───────────────────────── */}
        <section className="border-b border-rule bg-surface" aria-labelledby="dashboard-heading">
          <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lake-deep">
                  Campus Member Portal
                </p>
                <h1
                  id="dashboard-heading"
                  className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl"
                >
                  Welcome, {user?.name || 'Member'}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-quiet">
                  <span className="border border-bark bg-bark px-2 py-0.5 font-bold uppercase tracking-wider text-white">
                    {user?.role || 'STUDENT'}
                  </span>
                  {user?.prn && (
                    <span className="border border-rule bg-paper px-2 py-0.5 font-mono text-ink">
                      PRN: {user.prn}
                    </span>
                  )}
                  <span className="hidden sm:inline text-quiet/60">•</span>
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/report/lost"
                  className="inline-flex items-center gap-2 bg-bark px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ink"
                >
                  <PlusIcon />
                  <span>Report Lost Item</span>
                </Link>
                <Link
                  to="/report/found"
                  className="inline-flex items-center gap-2 border border-bark bg-surface px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-bark transition-colors hover:bg-bark hover:text-white"
                >
                  <PlusIcon />
                  <span>Report Found Item</span>
                </Link>
              </div>
            </div>

            {/* ── Metric Summary Tiles ────────────────────────────────────── */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 border-t border-rule pt-8">
              <div className="border border-rule bg-paper/40 p-4 sm:p-5">
                <span className="font-display text-xs font-semibold text-lake-deep" aria-hidden="true">
                  01
                </span>
                <p className="mt-1 text-2xl sm:text-3xl font-display font-medium text-ink">
                  {items.length}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-quiet">
                  Active Listings
                </p>
              </div>

              <div className="border border-rule bg-paper/40 p-4 sm:p-5">
                <span className="font-display text-xs font-semibold text-lake-deep" aria-hidden="true">
                  02
                </span>
                <p className="mt-1 text-2xl sm:text-3xl font-display font-medium text-ink">
                  {myReports.length}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-quiet">
                  My Submissions
                </p>
              </div>

              <div className="border border-rule bg-paper/40 p-4 sm:p-5">
                <span className="font-display text-xs font-semibold text-lake-deep" aria-hidden="true">
                  03
                </span>
                <p className="mt-1 text-2xl sm:text-3xl font-display font-medium text-ink">
                  {claims.length}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-quiet">
                  My Claims
                </p>
              </div>

              <div className="border border-rule bg-paper/40 p-4 sm:p-5">
                <span className="font-display text-xs font-semibold text-lake-deep" aria-hidden="true">
                  04
                </span>
                <p className="mt-1 text-2xl sm:text-3xl font-display font-medium text-ink">
                  {notifications.length}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-quiet">
                  Alerts &amp; Matches
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Campus Protocol Notice ───────────────────────────────────────── */}
        <section className="border-b border-rule bg-surface/60">
          <div className="mx-auto flex max-w-6xl items-start gap-3.5 px-6 py-4 text-xs leading-relaxed text-ink/90 sm:items-center">
            <ShieldCheckIcon className="h-5 w-5 shrink-0 text-lake-deep mt-0.5 sm:mt-0" />
            <p>
              <strong className="font-semibold text-ink">Campus Handover Protocol:</strong>{' '}
              All recovered items are stored securely at Room 104, Student Affairs Office. In-person collection is verified against your physical college ID card during office hours (Mon–Fri, 9 AM – 5 PM).
            </p>
          </div>
        </section>

        {/* ── Main Content Area ────────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          {/* Section: Live Campus Registry */}
          <section aria-labelledby="registry-heading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lake-deep">
                  Campus Registry
                </p>
                <h2
                  id="registry-heading"
                  className="mt-1 font-display text-2xl font-medium tracking-tight text-ink"
                >
                  Recent Property Reports
                </h2>
              </div>

              <Link
                to="/items"
                className="text-xs font-semibold uppercase tracking-wider text-lake-deep hover:underline underline-offset-4"
              >
                Browse all registry listings →
              </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-6 border border-rule bg-surface p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Type Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter item types">
                  <button
                    type="button"
                    onClick={() => setTypeFilter('all')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      typeFilter === 'all'
                        ? 'bg-bark text-white'
                        : 'border border-rule bg-paper/60 text-quiet hover:bg-paper hover:text-ink'
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter(ITEM_TYPES.LOST)}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      typeFilter === ITEM_TYPES.LOST
                        ? 'bg-bark text-white'
                        : 'border border-rule bg-paper/60 text-quiet hover:bg-paper hover:text-ink'
                    }`}
                  >
                    Lost Items
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter(ITEM_TYPES.FOUND)}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      typeFilter === ITEM_TYPES.FOUND
                        ? 'bg-lake-deep text-white'
                        : 'border border-rule bg-paper/60 text-quiet hover:bg-paper hover:text-ink'
                    }`}
                  >
                    Found Items
                  </button>
                </div>

                {/* Search Input & Category Dropdown */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1 sm:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-quiet" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, brand, location…"
                      className="w-full border border-rule bg-paper/40 py-1.5 pl-9 pr-3 text-xs text-ink placeholder:text-quiet/60 focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/20"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-rule bg-paper/40 px-3 py-1.5 text-xs text-ink focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/20"
                  >
                    <option value="All">All Categories</option>
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Item Grid */}
            <div className="mt-6">
              {error ? (
                <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  <p className="font-semibold">Unable to load registry listings</p>
                  <p className="mt-1 text-xs">{error}</p>
                </div>
              ) : (
                <ItemGrid
                  items={filteredItems}
                  loading={loading}
                  emptyMessage="No reports match your current filter parameters."
                />
              )}
            </div>
          </section>

          {/* ── My Activity Section (Two Columns) ─────────────────────────── */}
          <section className="mt-16 border-t border-rule pt-12" aria-labelledby="activity-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lake-deep">
              Personal Tracking
            </p>
            <h2
              id="activity-heading"
              className="mt-1 font-display text-2xl font-medium tracking-tight text-ink"
            >
              My Activity &amp; Status
            </h2>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {/* Left Column: My Reports */}
              <div className="border border-rule bg-surface p-6">
                <div className="flex items-center justify-between border-b border-rule pb-4">
                  <h3 className="font-display text-lg font-medium text-ink">
                    My Submissions
                  </h3>
                  <Link
                    to="/my-reports"
                    className="text-xs font-semibold text-lake-deep hover:underline"
                  >
                    View all ({myReports.length})
                  </Link>
                </div>

                <div className="mt-4 divide-y divide-rule/60">
                  {myReports.length === 0 ? (
                    <div className="py-8 text-center text-xs text-quiet">
                      <p>You have not submitted any item reports yet.</p>
                      <Link
                        to="/report/lost"
                        className="mt-3 inline-block border border-bark px-3 py-1 text-[11px] font-semibold text-bark hover:bg-bark hover:text-white"
                      >
                        File a Report
                      </Link>
                    </div>
                  ) : (
                    myReports.slice(0, 4).map((report) => (
                      <div key={report._id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              report.type === 'lost' ? 'bg-bark text-white' : 'bg-lake-deep text-white'
                            }`}
                          >
                            {report.type}
                          </span>
                          <Link
                            to={`/items/${report._id}`}
                            className="mt-1 block font-display text-sm font-medium text-ink hover:text-lake-deep"
                          >
                            {report.name}
                          </Link>
                          <p className="text-[11px] text-quiet">
                            {report.location} • {formatDate(report.dateReported)}
                          </p>
                        </div>
                        <span className="shrink-0 border border-rule px-2 py-0.5 text-[10px] font-semibold uppercase text-quiet">
                          {report.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: My Claims */}
              <div className="border border-rule bg-surface p-6">
                <div className="flex items-center justify-between border-b border-rule pb-4">
                  <h3 className="font-display text-lg font-medium text-ink">
                    My Ownership Claims
                  </h3>
                  <Link
                    to="/my-claims"
                    className="text-xs font-semibold text-lake-deep hover:underline"
                  >
                    View all ({claims.length})
                  </Link>
                </div>

                <div className="mt-4 divide-y divide-rule/60">
                  {claims.length === 0 ? (
                    <div className="py-8 text-center text-xs text-quiet">
                      <p>You have no active claims submitted.</p>
                      <p className="mt-1 text-[11px] text-quiet/70">
                        When you recognize a found item, submit a claim for administrative verification.
                      </p>
                    </div>
                  ) : (
                    claims.slice(0, 4).map((claim) => (
                      <div key={claim._id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-sm font-medium text-ink">
                            {typeof claim.itemId === 'object' ? claim.itemId?.name : `Claim #${claim._id.slice(-6)}`}
                          </p>
                          <p className="mt-0.5 text-xs text-quiet line-clamp-1">
                            {claim.reason}
                          </p>
                          <p className="mt-1 text-[11px] text-quiet">
                            Submitted {formatDate(claim.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            claim.status === 'approved'
                              ? 'bg-green-800 text-white'
                              : claim.status === 'rejected'
                              ? 'bg-red-800 text-white'
                              : 'border border-rule bg-paper text-quiet'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
