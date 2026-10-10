import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminClaims, updateClaim } from '../../api/adminApi'
import { formatDate } from '../../utils/formatDate'
import Sidebar from '../../components/common/Sidebar'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ClaimStatusBadge from '../../components/claims/ClaimStatusBadge'

export default function AdminClaims() {
  const [claims, setClaims] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  // Review modal state
  const [activeClaim, setActiveClaim] = useState(null)
  const [reviewAction, setReviewAction] = useState(null) // 'approved' or 'rejected'
  const [adminNote, setAdminNote] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [modalError, setModalError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await getAdminClaims({
          page,
          limit: 15,
          status: statusFilter || undefined,
        })
        if (!ignore) {
          setClaims(res.data || [])
          if (res.pagination) {
            setPagination(res.pagination)
          }
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Failed to retrieve claims registry.')
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
  }, [page, statusFilter])

  const openReviewModal = (claim, action) => {
    setActiveClaim(claim)
    setReviewAction(action)
    setAdminNote(
      action === 'approved'
        ? 'Identity verified in person. Ownership proof authenticated at Central Security Desk.'
        : 'Details provided do not match the physical characteristics of the recovered property.'
    )
    setModalError(null)
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    if (!activeClaim || !reviewAction) return

    setSubmittingReview(true)
    setModalError(null)
    try {
      await updateClaim(activeClaim._id, {
        status: reviewAction,
        adminNote: adminNote.trim(),
      })

      // Update state locally
      setClaims((prev) =>
        prev.map((c) =>
          c._id === activeClaim._id
            ? { ...c, status: reviewAction, adminNotes: adminNote.trim() }
            : c
        )
      )

      setActiveClaim(null)
      setReviewAction(null)
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to submit claim verdict.')
    } finally {
      setSubmittingReview(false)
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
                Institutional Adjudication
              </span>
              <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                Review Ownership Claims
              </h1>
              <p className="mt-1 text-xs text-quiet">
                Authenticate claimant testimony against item logs. Authorize physical custody handover.
              </p>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="border-b border-rule bg-surface px-6 py-4 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="filterStatus" className="text-xs font-semibold uppercase tracking-wider text-quiet">
                Filter Status:
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
                <option value="">All Claims</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <span className="text-xs text-quiet">
              Total Filed: {pagination.totalItems || claims.length}
            </span>
          </div>
        </div>

        {/* Content Area */}
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
                <p className="text-xs uppercase tracking-wider text-quiet">Loading claims record...</p>
              </div>
            </div>
          ) : claims.length === 0 ? (
            <div className="border border-dashed border-rule bg-surface p-12 text-center text-xs text-quiet">
              No claims found matching the specified filter.
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => {
                const item = claim.itemId || {}
                const claimant = claim.claimantId || {}

                return (
                  <div
                    key={claim._id}
                    className="border border-rule bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* Left info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-lake">
                            {item.category || 'Item Claim'}
                          </span>
                          <span className="text-quiet text-xs" aria-hidden="true">&bull;</span>
                          <span className="text-[11px] text-quiet">
                            Logged {formatDate(claim.createdAt)}
                          </span>
                        </div>

                        <h2 className="mt-1 font-display text-lg font-medium text-ink">
                          {item._id ? (
                            <Link to={`/items/${item._id}`} className="hover:text-lake hover:underline">
                              {item.name || 'Unspecified Item'}
                            </Link>
                          ) : (
                            item.name || 'Unspecified Item'
                          )}
                        </h2>

                        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 text-xs">
                          <div>
                            <span className="text-quiet">Claimant: </span>
                            <span className="font-semibold text-ink">{claimant.name || 'Campus Member'}</span>
                            {claimant.prn && (
                              <span className="text-quiet ml-1 font-mono">({claimant.prn})</span>
                            )}
                          </div>
                          <div>
                            <span className="text-quiet">Email: </span>
                            <span className="font-mono text-ink">{claimant.email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge & Action buttons */}
                      <div className="flex shrink-0 items-center gap-3">
                        <ClaimStatusBadge status={claim.status} />

                        {claim.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openReviewModal(claim, 'approved')}
                              className="border border-green-800 bg-green-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-900 hover:bg-green-100"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openReviewModal(claim, 'rejected')}
                              className="border border-red-800 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-900 hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verification Details comparison box */}
                    <div className="mt-4 border-t border-rule pt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 text-xs">
                      <div className="bg-paper p-3 border border-rule">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-quiet">
                          Claimant Verification Statement:
                        </span>
                        <p className="mt-1 text-ink leading-relaxed">
                          {claim.reason}
                        </p>
                      </div>

                      <div className="bg-paper p-3 border border-rule">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-quiet">
                          Administrative Decision Notes:
                        </span>
                        <p className="mt-1 text-ink leading-relaxed italic">
                          {claim.adminNotes || (claim.status === 'pending' ? 'Pending decision.' : 'No notes appended.')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      </main>

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(activeClaim)}
        onClose={() => setActiveClaim(null)}
        title={`Adjudicate Claim: ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <p className="text-xs text-quiet">
            {reviewAction === 'approved'
              ? 'Approving this claim marks the item as Returned in the registry and dispatches an official release notification to the claimant.'
              : 'Rejecting this claim notifies the claimant that the verification was unsuccessful.'}
          </p>

          {modalError && (
            <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {modalError}
            </div>
          )}

          <div>
            <label htmlFor="adjudicationNotes" className="block text-xs font-semibold uppercase tracking-wider text-bark">
              Administrative Record / Handover Instructions
            </label>
            <textarea
              id="adjudicationNotes"
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              required
              className="mt-1.5 w-full border border-rule bg-surface p-3 text-xs font-sans text-ink placeholder-quiet focus:border-lake focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-rule pt-4">
            <button
              type="button"
              onClick={() => setActiveClaim(null)}
              disabled={submittingReview}
              className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bark hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className={`border px-5 py-2 text-xs font-semibold uppercase tracking-wider text-surface disabled:opacity-50 ${
                reviewAction === 'approved'
                  ? 'border-green-800 bg-green-900 hover:bg-green-800'
                  : 'border-red-800 bg-red-900 hover:bg-red-800'
              }`}
            >
              {submittingReview
                ? 'Saving Decision...'
                : reviewAction === 'approved'
                ? 'Authorize Approval'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
