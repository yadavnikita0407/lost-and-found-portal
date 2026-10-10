import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminReports, updateReport } from '../../api/adminApi'
import { formatDate } from '../../utils/formatDate'
import Sidebar from '../../components/common/Sidebar'
import Pagination from '../../components/common/Pagination'

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await getAdminReports({
          page,
          limit: 15,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        })
        if (!ignore) {
          setReports(res.data || [])
          if (res.pagination) {
            setPagination(res.pagination)
          }
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Failed to retrieve administrative reports.')
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
  }, [page, statusFilter, typeFilter])

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      await updateReport(id, { status: newStatus })
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      )
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update report status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-paper">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="border-b border-rule bg-surface py-6 px-6 sm:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-lake-deep">
                Institutional Moderation
              </span>
              <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                Manage Item Reports
              </h1>
              <p className="mt-1 text-xs text-quiet">
                Examine declarations filed by students and staff. Moderate status transitions and resolve custody records.
              </p>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="border-b border-rule bg-surface px-6 py-4 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="filterType" className="text-xs font-semibold uppercase tracking-wider text-quiet">
                Type:
              </label>
              <select
                id="filterType"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="border border-rule bg-surface px-3 py-1.5 text-xs font-sans text-ink focus:border-lake focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>

              <label htmlFor="filterStatus" className="text-xs font-semibold uppercase tracking-wider text-quiet ml-2">
                Status:
              </label>
              <select
                id="filterStatus"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="border border-rule bg-surface px-3 py-1.5 text-xs font-sans text-ink focus:border-lake focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="claimed">Claimed</option>
                <option value="returned">Returned</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <span className="text-xs text-quiet">
              Total Cataloged: {pagination.totalItems || reports.length}
            </span>
          </div>
        </div>

        {/* Reports Table */}
        <div className="p-6 sm:p-10">
          {error && (
            <div className="mb-6 border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-bark" />
                <p className="text-xs uppercase tracking-wider text-quiet">Loading report registry...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="border border-dashed border-rule bg-surface p-12 text-center text-xs text-quiet">
              No reports found matching the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto border border-rule bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <table className="min-w-full divide-y divide-rule text-left text-xs font-sans">
                <thead className="bg-paper text-quiet uppercase tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Item & Details</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Type</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Reporter</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Location & Date</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Identifying Marks</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right font-semibold">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule bg-surface text-ink">
                  {reports.map((item) => (
                    <tr key={item._id} className="hover:bg-paper/40 transition-colors">
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

                      <td className="px-6 py-4">
                        <span className="font-medium text-ink block">{item.reporterId?.name || 'Member'}</span>
                        <span className="text-[11px] text-quiet block">{item.reporterId?.email || 'N/A'}</span>
                        {item.reporterId?.prn && (
                          <span className="text-[10px] font-mono text-quiet">PRN: {item.reporterId.prn}</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-ink block">{item.location}</span>
                        <span className="text-[11px] text-quiet block">{formatDate(item.dateReported)}</span>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <span className="text-[11px] text-quiet font-mono truncate block" title={item.uniqueDetails || 'None'}>
                          {item.uniqueDetails || 'None recorded'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            item.status === 'active'
                              ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                              : item.status === 'claimed'
                              ? 'border border-lake/30 bg-lake/10 text-lake-deep'
                              : item.status === 'returned'
                              ? 'border border-green-800 bg-green-50 text-green-900'
                              : 'border border-red-300 bg-red-50 text-red-900'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'active' && (
                            <button
                              type="button"
                              disabled={updatingId === item._id}
                              onClick={() => handleStatusChange(item._id, 'active')}
                              className="border border-rule bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink hover:bg-paper disabled:opacity-40"
                              title="Mark active"
                            >
                              Approve
                            </button>
                          )}
                          {item.status !== 'returned' && (
                            <button
                              type="button"
                              disabled={updatingId === item._id}
                              onClick={() => handleStatusChange(item._id, 'returned')}
                              className="border border-green-300 bg-green-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-green-900 hover:bg-green-100 disabled:opacity-40"
                              title="Mark returned to owner"
                            >
                              Returned
                            </button>
                          )}
                          {item.status !== 'rejected' && (
                            <button
                              type="button"
                              disabled={updatingId === item._id}
                              onClick={() => handleStatusChange(item._id, 'rejected')}
                              className="border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-800 hover:bg-red-100 disabled:opacity-40"
                              title="Reject declaration"
                            >
                              Reject
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

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      </main>
    </div>
  )
}
