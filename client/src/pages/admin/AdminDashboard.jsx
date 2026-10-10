import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getAdminClaims, getAdminReports, getLogs } from '../../api/adminApi'
import { formatDate } from '../../utils/formatDate'
import Sidebar from '../../components/common/Sidebar'
import StatCard from '../../components/admin/StatCard'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    returnedItems: 0,
    totalUsers: 0,
    pendingClaims: 0,
  })
  const [pendingClaims, setPendingClaims] = useState([])
  const [recentReports, setRecentReports] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true)
      setError(null)
      try {
        const [statsRes, claimsRes, reportsRes, logsRes] = await Promise.all([
          getStats(),
          getAdminClaims({ status: 'pending', limit: 5 }),
          getAdminReports({ limit: 5 }),
          getLogs({ limit: 6 }),
        ])

        if (statsRes?.data) setStats(statsRes.data)
        if (claimsRes?.data) setPendingClaims(claimsRes.data)
        if (reportsRes?.data) setRecentReports(reportsRes.data)
        if (logsRes?.data) setAuditLogs(logsRes.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to retrieve administrative dashboard metrics.')
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-paper">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="border-b border-rule bg-surface py-6 px-6 sm:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-lake-deep">
                Institutional Administration &bull; Campus Security
              </span>
              <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                Operations Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/reports"
                className="border border-rule bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-bark transition-colors hover:bg-paper"
              >
                All Reports
              </Link>
              <Link
                to="/admin/claims"
                className="bg-bark px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-surface transition-colors hover:bg-lake-deep"
              >
                Process Claims
              </Link>
            </div>
          </div>
        </header>

        {error && (
          <div className="mx-6 sm:mx-10 mt-6 border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            {error}
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          {/* Stat Cards Grid */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Operations Metrics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                index="01"
                label="Total Cataloged Items"
                count={loading ? '—' : stats.totalItems}
                subtext={`${stats.lostItems || 0} lost / ${stats.foundItems || 0} found`}
              />
              <StatCard
                index="02"
                label="Pending Claims"
                count={loading ? '—' : stats.pendingClaims}
                subtext="Awaiting review"
              />
              <StatCard
                index="03"
                label="Restored Belongings"
                count={loading ? '—' : stats.returnedItems}
                subtext="Closed handovers"
              />
              <StatCard
                index="04"
                label="Registered Members"
                count={loading ? '—' : stats.totalUsers}
                subtext="Students & staff"
              />
            </div>
          </section>

          {/* Pending Claims Queue & Recent Reports */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Pending Claims */}
            <div className="border border-rule bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-rule p-5">
                <div>
                  <h3 className="font-display text-base font-medium text-ink">
                    Pending Claims Review
                  </h3>
                  <p className="text-[11px] text-quiet">
                    Ownership proofs requiring administrative validation
                  </p>
                </div>
                <Link
                  to="/admin/claims"
                  className="text-xs font-semibold uppercase tracking-wider text-lake hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              {pendingClaims.length === 0 ? (
                <div className="p-8 text-center text-xs text-quiet">
                  No claims currently awaiting review. All items are up to date.
                </div>
              ) : (
                <div className="divide-y divide-rule text-xs font-sans">
                  {pendingClaims.map((claim) => (
                    <div key={claim._id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-ink">
                          {claim.itemId?.name || 'Unspecified Item'}
                        </div>
                        <div className="text-[11px] text-quiet">
                          Claimant: {claim.claimantId?.name || 'Student/Staff'} &bull; {formatDate(claim.createdAt)}
                        </div>
                      </div>
                      <Link
                        to="/admin/claims"
                        className="shrink-0 border border-rule bg-paper px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink hover:bg-surface"
                      >
                        Examine
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reports */}
            <div className="border border-rule bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-rule p-5">
                <div>
                  <h3 className="font-display text-base font-medium text-ink">
                    Recent Item Submissions
                  </h3>
                  <p className="text-[11px] text-quiet">
                    Latest declarations entered into registry
                  </p>
                </div>
                <Link
                  to="/admin/reports"
                  className="text-xs font-semibold uppercase tracking-wider text-lake hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              {recentReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-quiet">
                  No recent reports recorded in database.
                </div>
              ) : (
                <div className="divide-y divide-rule text-xs font-sans">
                  {recentReports.map((item) => (
                    <div key={item._id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-ink">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-quiet">
                          {item.category} &bull; {item.location} &bull; {formatDate(item.createdAt)}
                        </div>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          item.type === 'lost'
                            ? 'border border-amber-300 bg-amber-50 text-amber-900'
                            : 'border border-blue-300 bg-blue-50 text-blue-900'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audit Activity Log */}
          <div className="border border-rule bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="border-b border-rule p-5">
              <h3 className="font-display text-base font-medium text-ink">
                Administrative Audit Trail
              </h3>
              <p className="text-[11px] text-quiet">
                Chronological ledger of security officer verifications and status transitions
              </p>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-quiet">
                No recent activity logged.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-rule text-left text-xs font-sans">
                  <thead className="bg-paper text-quiet uppercase tracking-wider text-[11px]">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-semibold">Timestamp</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Actor</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Action Type</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Target ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule bg-surface text-ink">
                    {auditLogs.map((log) => (
                      <tr key={log._id || log.id}>
                        <td className="px-6 py-3 text-quiet">{formatDate(log.timestamp || log.createdAt)}</td>
                        <td className="px-6 py-3 font-medium">{log.actorId?.name || log.actor || 'Administrator'}</td>
                        <td className="px-6 py-3">
                          <span className="font-mono text-[11px] bg-paper px-1.5 py-0.5 border border-rule">
                            {log.actionType || log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-[11px] text-quiet">
                          {String(log.targetId || log.target).slice(-10)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
