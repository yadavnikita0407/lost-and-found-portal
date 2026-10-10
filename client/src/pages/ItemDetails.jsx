import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchItemById, deleteItem } from '../api/itemsApi'
import { submitClaim } from '../api/claimsApi'
import { getMatchesForItem } from '../api/matchesApi'
import { formatDate } from '../utils/formatDate'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Modal from '../components/common/Modal'
import ItemCard from '../components/items/ItemCard'

export default function ItemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Claim modal state
  const [claimOpen, setClaimOpen] = useState(false)
  const [claimReason, setClaimReason] = useState('')
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimError, setClaimError] = useState(null)

  // Delete state
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const response = await fetchItemById(id)
        if (!ignore) {
          setItem(response.data)
          setError(null)
        }

        try {
          const matchesRes = await getMatchesForItem(id)
          if (!ignore) {
            setMatches(matchesRes.data || [])
          }
        } catch {
          if (!ignore) {
            setMatches([])
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Item not found or unavailable.')
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
  }, [id])

  const isOwner =
    user &&
    item &&
    (item.reporterId?._id === user.id ||
      item.reporterId?._id === user._id ||
      item.reporterId === user.id ||
      item.reporterId === user._id)

  const isAdmin = user && user.role === 'admin'

  const handleClaimSubmit = async (e) => {
    e.preventDefault()
    if (!claimReason.trim()) {
      setClaimError('Please provide details verifying your ownership.')
      return
    }

    setClaimSubmitting(true)
    setClaimError(null)
    try {
      await submitClaim({ itemId: item._id, reason: claimReason.trim() })
      setClaimSuccess(true)
      setClaimOpen(false)
      setClaimReason('')
    } catch (err) {
      setClaimError(err.response?.data?.message || err.message || 'Failed to submit ownership claim.')
    } finally {
      setClaimSubmitting(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to withdraw this item report from the registry?')) {
      return
    }

    setDeleteSubmitting(true)
    try {
      await deleteItem(item._id)
      navigate('/my-reports')
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Could not withdraw item.')
      setDeleteSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-bark" />
            <p className="text-xs uppercase tracking-wider text-quiet">Loading item dossier...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <div className="border border-rule bg-surface p-10">
              <h1 className="font-display text-2xl font-medium text-ink">Item Record Not Found</h1>
              <p className="mt-2 text-sm text-quiet">{error || 'The requested item record does not exist or has been removed.'}</p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  to="/items"
                  className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-paper"
                >
                  Return to Registry
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-bark px-4 py-2 text-xs font-semibold uppercase tracking-wider text-surface hover:bg-lake-deep"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb & Navigation */}
        <section className="border-b border-rule bg-surface py-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lake-deep">
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                <span className="text-rule" aria-hidden="true">/</span>
                <Link to="/items" className="hover:underline">Registry</Link>
                <span className="text-rule" aria-hidden="true">/</span>
                <span className="text-quiet font-normal truncate max-w-xs">{item.name}</span>
              </div>

              <Link
                to="/items"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-quiet hover:text-ink"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Registry
              </Link>
            </div>
          </div>
        </section>

        {/* Claim Success Banner */}
        {claimSuccess && (
          <div className="bg-lake/10 border-b border-lake/20 py-3">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-3 text-xs text-lake-deep">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0 text-lake" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <strong>Claim Logged:</strong> Your ownership claim has been submitted to campus administration for review. Check status in <Link to="/my-claims" className="underline font-semibold">My Claims</Link>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setClaimSuccess(false)}
                  className="text-lake-deep hover:underline font-semibold uppercase tracking-wider text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dossier Content */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Visual Column */}
            <div className="lg:col-span-5">
              <div className="border border-rule bg-surface p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                {item.photoUrl ? (
                  <div className="relative aspect-square w-full overflow-hidden bg-paper border border-rule">
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center border border-dashed border-rule bg-paper p-6 text-center text-quiet">
                    <svg className="h-16 w-16 text-quiet/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="mt-3 text-xs uppercase tracking-wider">No Photographic Record Attached</span>
                    <span className="mt-1 text-[11px] text-quiet/70">Surrendered in-person or verbal report filed</span>
                  </div>
                )}

                {/* Status Badges */}
                <div className="mt-4 flex items-center justify-between border-t border-rule pt-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        item.type === 'lost'
                          ? 'border border-amber-300 bg-amber-50 text-amber-900'
                          : 'border border-blue-300 bg-blue-50 text-blue-900'
                      }`}
                    >
                      {item.type === 'lost' ? 'Reported Lost' : 'Found Unattended'}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        item.status === 'active'
                          ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                          : item.status === 'claimed'
                          ? 'border border-lake/30 bg-lake/10 text-lake-deep'
                          : 'border border-rule bg-paper text-quiet'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-quiet">
                    ID: {String(item._id).slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Handover / Location Notice */}
              <div className="mt-4 border border-rule bg-surface p-4 text-xs leading-relaxed text-quiet">
                <p className="font-semibold text-ink">Custody & Verification Notice:</p>
                <p className="mt-1">
                  Valuable belongings logged here undergo verification at the Campus Security Central Desk. Bring valid student/staff ID and supporting proof of ownership for physical retrieval.
                </p>
              </div>
            </div>

            {/* Details Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Title & Metadata */}
              <div className="border border-rule bg-surface p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-lake">
                      {item.category}
                    </span>
                    <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                      {item.name}
                    </h1>
                  </div>

                  {/* Actions for owner */}
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteItem}
                        disabled={deleteSubmitting}
                        className="border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deleteSubmitting ? 'Cancelling...' : 'Withdraw Report'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary specs grid */}
                <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-b border-rule py-6 sm:grid-cols-2 text-xs">
                  <div>
                    <dt className="font-medium text-quiet uppercase tracking-wider text-[11px]">Location Observed</dt>
                    <dd className="mt-1 font-semibold text-ink">{item.location}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-quiet uppercase tracking-wider text-[11px]">Incident Date</dt>
                    <dd className="mt-1 font-semibold text-ink">{formatDate(item.dateReported)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-quiet uppercase tracking-wider text-[11px]">Brand / Manufacturer</dt>
                    <dd className="mt-1 font-semibold text-ink">{item.brand || 'Unbranded / Not indicated'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-quiet uppercase tracking-wider text-[11px]">Colour / Appearance</dt>
                    <dd className="mt-1 font-semibold text-ink">{item.colour || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-quiet uppercase tracking-wider text-[11px]">Logged On</dt>
                    <dd className="mt-1 font-semibold text-ink">{formatDate(item.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-quiet uppercase tracking-wider text-[11px]">Reporter Authority</dt>
                    <dd className="mt-1 font-semibold text-ink">
                      {item.reporterId?.name || 'Campus Member'} {isOwner ? '(You)' : ''}
                    </dd>
                  </div>
                </dl>

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-quiet">
                    Official Description
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink whitespace-pre-line">
                    {item.description || 'No extended remarks provided.'}
                  </p>
                </div>

                {/* Unique Details (Masked for privacy) */}
                <div className="mt-6 border-t border-rule pt-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-quiet">
                    Confidential Identifying Marks
                  </h2>
                  {item.uniqueDetails ? (
                    <p className="mt-2 text-xs font-mono bg-paper p-3 border border-rule text-ink">
                      {item.uniqueDetails}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-quiet italic bg-paper p-3 border border-rule">
                      {isOwner || isAdmin
                        ? 'None logged.'
                        : 'Confidential details masked to prevent fraudulent claims. Legitimate claimants must verify specific marks with administrators.'}
                    </p>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="mt-8 border-t border-rule pt-6 flex flex-wrap items-center justify-between gap-4">
                  {item.type === 'found' && !isOwner && item.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => setClaimOpen(true)}
                      className="border border-bark bg-bark px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-lake-deep"
                    >
                      File Ownership Claim
                    </button>
                  ) : item.type === 'found' && isOwner ? (
                    <span className="text-xs font-semibold text-quiet">
                      You are the registered reporter of this found item.
                    </span>
                  ) : (
                    <span className="text-xs text-quiet">
                      {item.type === 'lost'
                        ? 'Lost item inquiry: If you have recovered this item, report it as found or surrender it to Central Security.'
                        : `Item status is currently "${item.status}".`}
                    </span>
                  )}

                  <Link
                    to="/items"
                    className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bark transition-colors hover:bg-paper"
                  >
                    Browse Other Records
                  </Link>
                </div>
              </div>

              {/* Match Suggestions (if any) */}
              {matches.length > 0 && (
                <div className="border border-rule bg-surface p-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-lake" />
                    <h2 className="font-display text-lg font-medium text-ink">
                      Potential Algorithmic Matches ({matches.length})
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-quiet">
                    Our cross-referencing system detected counterpart entries that share similar descriptions, categories, or locations.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {matches.map((m) => {
                      const matchedItem =
                        String(m.lostItemId?._id) === String(item._id)
                          ? m.foundItemId
                          : m.lostItemId
                      if (!matchedItem) return null
                      return (
                        <div key={m._id} className="relative">
                          <div className="absolute top-2 right-2 z-10 border border-rule bg-surface px-1.5 py-0.5 text-[10px] font-mono font-bold text-lake-deep shadow-xs">
                            {Math.round(m.score * 100)}% match
                          </div>
                          <ItemCard item={matchedItem} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Claim Submission Modal */}
      <Modal
        isOpen={claimOpen}
        onClose={() => setClaimOpen(false)}
        title="Submit Item Ownership Claim"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <p className="text-xs leading-relaxed text-quiet">
            To prevent unauthorized release of property, please describe specific verifiable features of <strong>{item.name}</strong> that are not visible in public photos (e.g. engravings, wallpaper, serial numbers, concealed contents, receipts).
          </p>

          {claimError && (
            <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {claimError}
            </div>
          )}

          <div>
            <label htmlFor="claimReason" className="block text-xs font-semibold uppercase tracking-wider text-bark">
              Ownership Verification Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="claimReason"
              rows={4}
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              required
              placeholder="e.g. Inside the side pocket there is an student ID badge ending with 4019 and a silver keychain with two small brass keys..."
              className="mt-1.5 w-full border border-rule bg-surface p-3 text-xs font-sans text-ink placeholder-quiet transition-colors focus:border-lake focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-rule pt-4">
            <button
              type="button"
              onClick={() => setClaimOpen(false)}
              disabled={claimSubmitting}
              className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bark hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={claimSubmitting}
              className="border border-bark bg-bark px-5 py-2 text-xs font-semibold uppercase tracking-wider text-surface hover:bg-lake-deep disabled:opacity-50"
            >
              {claimSubmitting ? 'Submitting Claim...' : 'Confirm & Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  )
}
