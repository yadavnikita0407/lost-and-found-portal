import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, markRead, markAllRead } from '../api/notificationsApi'
import { formatDate } from '../utils/formatDate'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'unread'
  const [markingAll, setMarkingAll] = useState(false)

  const reloadNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getNotifications()
      setNotifications(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to retrieve notification history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await getNotifications()
        if (!ignore) {
          setNotifications(res.data || [])
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Unable to retrieve notification history.')
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

  const handleMarkOne = async (id) => {
    try {
      await markRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification read', err)
    }
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try {
      await markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read', err)
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="border-b border-rule bg-surface py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lake-deep">
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <span className="text-rule" aria-hidden="true">/</span>
              <span>Notifications</span>
            </div>
            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                  Notification Center
                </h1>
                <p className="mt-1 text-sm text-quiet">
                  System notices regarding cross-referenced matches, claim approvals, and registry events.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  className="border border-rule bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bark transition-colors hover:bg-paper disabled:opacity-50"
                >
                  {markingAll ? 'Updating...' : `Mark All Read (${unreadCount})`}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="border-b border-rule bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === 'all'
                    ? 'border border-bark bg-bark text-surface'
                    : 'border border-rule bg-surface text-ink hover:bg-paper'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === 'unread'
                    ? 'border border-bark bg-bark text-surface'
                    : 'border border-rule bg-surface text-ink hover:bg-paper'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
        </div>

        {/* Notification Feed */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-bark" />
                <p className="text-xs uppercase tracking-wider text-quiet">Loading notices...</p>
              </div>
            </div>
          ) : error ? (
            <div className="border border-rule bg-surface p-8 text-center">
              <p className="font-display text-base font-medium text-ink">{error}</p>
              <button
                type="button"
                onClick={reloadNotifications}
                className="mt-4 border border-rule bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-surface"
              >
                Retry
              </button>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="border border-dashed border-rule bg-surface p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-quiet/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h2 className="mt-3 font-display text-lg font-medium text-ink">
                {filter === 'unread' ? 'No Unread Notifications' : 'No Activity Records'}
              </h2>
              <p className="mt-1 text-xs text-quiet">
                {filter === 'unread'
                  ? 'All notifications have been reviewed.'
                  : 'You will receive notifications when matches are found or your reports are reviewed.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-rule border border-rule bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              {displayedNotifications.map((notif) => {
                const isMatch = notif.type === 'match_suggested' || notif.type?.includes('match')
                const isClaim = notif.type?.includes('claim')

                return (
                  <div
                    key={notif._id}
                    className={`flex items-start justify-between gap-4 p-5 transition-colors ${
                      notif.isRead ? 'bg-surface' : 'bg-paper/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Icon */}
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                          isMatch
                            ? 'border-lake/30 bg-lake/10 text-lake-deep'
                            : isClaim
                            ? 'border-blue-300 bg-blue-50 text-blue-900'
                            : 'border-rule bg-paper text-quiet'
                        }`}
                      >
                        {isMatch ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        ) : isClaim ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-quiet">
                            {notif.type ? notif.type.replace(/_/g, ' ') : 'Notice'}
                          </span>
                          {!notif.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-lake" title="Unread" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-ink font-medium">
                          {notif.message}
                        </p>

                        <div className="mt-2 flex items-center gap-4 text-[11px] text-quiet">
                          <span>{formatDate(notif.createdAt)}</span>

                          {/* Reference Link */}
                          {notif.refId && notif.refModel === 'Item' && (
                            <Link
                              to={`/items/${notif.refId}`}
                              className="font-semibold text-lake hover:underline"
                            >
                              Inspect Item Dossier &rarr;
                            </Link>
                          )}
                          {notif.refId && notif.refModel === 'Claim' && (
                            <Link
                              to="/my-claims"
                              className="font-semibold text-lake hover:underline"
                            >
                              View Claim Details &rarr;
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mark Read Button */}
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkOne(notif._id)}
                        className="shrink-0 border border-rule bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-quiet hover:border-bark hover:text-ink"
                      >
                        Mark Read
                      </button>
                    )}
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
