import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyClaims } from '../api/claimsApi'
import { formatDate } from '../utils/formatDate'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ClaimStatusBadge from '../components/claims/ClaimStatusBadge'

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reloadClaims = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyClaims()
      setClaims(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to retrieve your ownership claims.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await getMyClaims()
        if (!ignore) {
          setClaims(res.data || [])
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Failed to retrieve your ownership claims.')
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
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="border-b border-rule bg-surface py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lake-deep">
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <span className="text-rule" aria-hidden="true">/</span>
              <span>My Claims</span>
            </div>
            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                  Ownership Claims
                </h1>
                <p className="mt-1 text-sm text-quiet">
                  Status of formal ownership declarations filed against recovered campus property.
                </p>
              </div>

              <Link
                to="/items"
                className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bark transition-colors hover:bg-paper"
              >
                Browse Registry
              </Link>
            </div>
          </div>
        </section>

        {/* Claims Content Area */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-bark" />
                <p className="text-xs uppercase tracking-wider text-quiet">Loading claims record...</p>
              </div>
            </div>
          ) : error ? (
            <div className="border border-rule bg-surface p-8 text-center">
              <p className="font-display text-base font-medium text-ink">{error}</p>
              <button
                type="button"
                onClick={reloadClaims}
                className="mt-4 border border-rule bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-surface"
              >
                Retry
              </button>
            </div>
          ) : claims.length === 0 ? (
            <div className="border border-dashed border-rule bg-surface p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-quiet/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="mt-3 font-display text-lg font-medium text-ink">No Claims Submitted</h2>
              <p className="mt-1 text-xs text-quiet max-w-md mx-auto">
                You haven&apos;t filed any ownership claims yet. If an item you misplaced has been discovered by someone else, locate it in the registry and click &quot;File Ownership Claim&quot;.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  to="/items"
                  className="bg-bark px-5 py-2 text-xs font-semibold uppercase tracking-wider text-surface hover:bg-lake-deep"
                >
                  Explore Registry
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => {
                const item = claim.itemId || {}
                const isApproved = claim.status === 'approved'
                const isRejected = claim.status === 'rejected'

                return (
                  <div
                    key={claim._id}
                    className="border border-rule bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: Item identity and claim proof */}
                      <div className="flex gap-4">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.name || 'Claimed item'}
                            className="h-16 w-16 shrink-0 border border-rule object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-rule bg-paper text-quiet">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-lake">
                              {item.category || 'General Registry'}
                            </span>
                            <span className="text-quiet text-xs" aria-hidden="true">&bull;</span>
                            <span className="text-[11px] text-quiet">
                              Submitted {formatDate(claim.createdAt)}
                            </span>
                          </div>

                          <h2 className="mt-0.5 font-display text-lg font-medium text-ink">
                            {item._id ? (
                              <Link to={`/items/${item._id}`} className="hover:text-lake hover:underline">
                                {item.name || 'Unspecified Item'}
                              </Link>
                            ) : (
                              item.name || 'Unspecified Item'
                            )}
                          </h2>

                          {item.location && (
                            <p className="mt-0.5 text-xs text-quiet">
                              Location Recovered: <span className="font-medium text-ink">{item.location}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Badge */}
                      <div className="flex shrink-0 items-center gap-3">
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                    </div>

                    {/* Claim Reason & Notes */}
                    <div className="mt-4 border-t border-rule pt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                      <div className="bg-paper p-3 border border-rule">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-quiet">
                          Your Verification Statement:
                        </span>
                        <p className="mt-1 text-ink leading-relaxed">
                          {claim.reason}
                        </p>
                      </div>

                      {/* Administrative Outcome */}
                      <div className={`p-3 border ${
                        isApproved
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                          : isRejected
                          ? 'border-red-200 bg-red-50 text-red-950'
                          : 'border-rule bg-paper text-quiet'
                      }`}>
                        <span className="font-semibold uppercase tracking-wider text-[11px]">
                          Administrative Assessment:
                        </span>
                        {claim.adminNotes ? (
                          <p className="mt-1 leading-relaxed">
                            {claim.adminNotes}
                          </p>
                        ) : isApproved ? (
                          <p className="mt-1 leading-relaxed">
                            Claim verified by campus staff. Please proceed to the Central Security Desk with your physical college ID card for final item release.
                          </p>
                        ) : isRejected ? (
                          <p className="mt-1 leading-relaxed">
                            Claim was not approved due to insufficient verification proof or conflicting details.
                          </p>
                        ) : (
                          <p className="mt-1 italic leading-relaxed text-quiet">
                            Pending administrative review. Security staff will examine your stated verification against the physically deposited item.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
