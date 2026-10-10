import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchItems, deleteItem } from '../api/itemsApi'
import { formatDate } from '../utils/formatDate'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function MyReports() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      if (!user) return
      try {
        const userId = user.id || user._id
        const res = await fetchItems({
          reporterId: userId,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          limit: 50,
        })

        if (!ignore) {
          const myItems = (res.data || []).filter((i) => {
            const repId = i.reporterId?._id || i.reporterId
            return String(repId) === String(userId)
          })
          setItems(myItems)
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Failed to load your filed reports.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [user, typeFilter, statusFilter])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to withdraw your report for "${name}"?`)) {
      return
    }

    try {
      await deleteItem(id)
      setItems((prev) => prev.filter((i) => i._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Could not withdraw report.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="border-b border-rule bg-surface py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lake-deep">
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <span className="text-rule" aria-hidden="true">/</span>
              <span>My Reports</span>
            </div>
            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                  My Filed Reports
                </h1>
                <p className="mt-1 text-sm text-quiet">
                  Manage all lost item declarations and found property submissions you have authored.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/report/lost"
                  className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bark transition-colors hover:bg-paper"
                >
                  Report Lost
                </Link>
                <Link
                  to="/report/found"
                  className="bg-bark px-4 py-2 text-xs font-semibold uppercase tracking-wider text-surface transition-colors hover:bg-lake-deep"
                >
                  Report Found
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="border-b border-rule bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-quiet">Filter Type:</span>
                <button
                  type="button"
                  onClick={() => setTypeFilter('')}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    typeFilter === '' ? 'border border-bark bg-bark text-surface' : 'border border-rule bg-surface text-ink hover:bg-paper'
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('lost')}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    typeFilter === 'lost' ? 'border border-amber-800 bg-amber-800 text-surface' : 'border border-rule bg-surface text-ink hover:bg-paper'
                  }`}
                >
                  Lost
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('found')}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    typeFilter === 'found' ? 'border border-blue-800 bg-blue-800 text-surface' : 'border border-rule bg-surface text-ink hover:bg-paper'
                  }`}
                >
                  Found
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="statusSelect" className="text-xs font-semibold uppercase tracking-wider text-quiet">
                  Status:
                </label>
                <select
                  id="statusSelect"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-rule bg-surface px-3 py-1 text-xs font-sans text-ink focus:border-lake focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="claimed">Claimed</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Content List */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-bark" />
                <p className="text-xs uppercase tracking-wider text-quiet">Fetching reports record...</p>
              </div>
            </div>
          ) : error ? (
            <div className="border border-rule bg-surface p-8 text-center">
              <p className="font-display text-base font-medium text-ink">{error}</p>
              <button
                type="button"
                onClick={loadMyReports}
                className="mt-4 border border-rule bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-surface"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="border border-dashed border-rule bg-surface p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-quiet/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="mt-3 font-display text-lg font-medium text-ink">No Reports Logged Yet</h2>
              <p className="mt-1 text-xs text-quiet max-w-md mx-auto">
                You haven&apos;t filed any lost or found notices matching the current filter. Once logged, your submissions will appear here for status tracking.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  to="/report/lost"
                  className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-paper"
                >
                  Report Misplaced Item
                </Link>
                <Link
                  to="/report/found"
                  className="bg-bark px-4 py-2 text-xs font-semibold uppercase tracking-wider text-surface hover:bg-lake-deep"
                >
                  Report Recovered Item
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-rule bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <table className="min-w-full divide-y divide-rule text-left text-xs font-sans">
                <thead className="bg-paper text-quiet uppercase tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Item & Category</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Type</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Location</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Reported Date</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule bg-surface text-ink">
                  {items.map((item) => (
                    <tr key={item._id} className="transition-colors hover:bg-paper/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.name}
                              className="h-10 w-10 shrink-0 border border-rule object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-rule bg-paper text-quiet">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <Link to={`/items/${item._id}`} className="font-medium text-ink hover:text-lake hover:underline">
                              {item.name}
                            </Link>
                            <span className="block text-[11px] text-quiet">{item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            item.type === 'lost'
                              ? 'border border-amber-300 bg-amber-50 text-amber-900'
                              : 'border border-blue-300 bg-blue-50 text-blue-900'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-quiet">{item.location}</td>
                      <td className="px-6 py-4 text-quiet">{formatDate(item.dateReported)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            item.status === 'active'
                              ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                              : item.status === 'claimed'
                              ? 'border border-lake/30 bg-lake/10 text-lake-deep'
                              : 'border border-rule bg-paper text-quiet'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/items/${item._id}`}
                            className="border border-rule bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-bark hover:bg-paper"
                          >
                            View
                          </Link>
                          {item.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id, item.name)}
                              className="border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-700 hover:bg-red-100"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
