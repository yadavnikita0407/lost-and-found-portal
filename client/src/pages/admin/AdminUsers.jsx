import { useState, useEffect } from 'react'
import { getUsers, updateUser } from '../../api/adminApi'
import { formatDate } from '../../utils/formatDate'
import Sidebar from '../../components/common/Sidebar'
import Pagination from '../../components/common/Pagination'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await getUsers({
          page,
          limit: 15,
          status: statusFilter || undefined,
          role: roleFilter || undefined,
        })
        if (!ignore) {
          setUsers(res.data || [])
          if (res.pagination) {
            setPagination(res.pagination)
          }
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Failed to retrieve user accounts.')
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
  }, [page, statusFilter, roleFilter])

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active'
    const confirmPrompt =
      nextStatus === 'suspended'
        ? `Are you sure you want to suspend access for ${user.name}? They will be blocked from logging in or submitting reports.`
        : `Reactivate access for ${user.name}?`

    if (!window.confirm(confirmPrompt)) return

    setUpdatingId(user._id)
    try {
      await updateUser(user._id, { status: nextStatus })
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
      )
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update user account status.')
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
                Institutional Directory
              </span>
              <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                User Accounts
              </h1>
              <p className="mt-1 text-xs text-quiet">
                Manage registered college members, review role allocations, and enforce access suspensions.
              </p>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="border-b border-rule bg-surface px-6 py-4 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="roleFilter" className="text-xs font-semibold uppercase tracking-wider text-quiet">
                Role:
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="border border-rule bg-surface px-3 py-1.5 text-xs font-sans text-ink focus:border-lake focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>

              <label htmlFor="userStatusFilter" className="text-xs font-semibold uppercase tracking-wider text-quiet ml-2">
                Status:
              </label>
              <select
                id="userStatusFilter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="border border-rule bg-surface px-3 py-1.5 text-xs font-sans text-ink focus:border-lake focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <span className="text-xs text-quiet">
              Total Enrolled: {pagination.totalItems || users.length}
            </span>
          </div>
        </div>

        {/* Content Table */}
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
                <p className="text-xs uppercase tracking-wider text-quiet">Loading user records...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="border border-dashed border-rule bg-surface p-12 text-center text-xs text-quiet">
              No user accounts found matching the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto border border-rule bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <table className="min-w-full divide-y divide-rule text-left text-xs font-sans">
                <thead className="bg-paper text-quiet uppercase tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Member Name</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">College PRN / ID</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Institutional Email</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Designation</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Enrolled On</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right font-semibold">Access Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule bg-surface text-ink">
                  {users.map((member) => (
                    <tr key={member._id} className="hover:bg-paper/40 transition-colors">
                      <td className="px-6 py-4 font-medium">{member.name}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-quiet">
                        {member.prn || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-quiet">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className="capitalize font-medium text-ink">{member.role}</span>
                      </td>
                      <td className="px-6 py-4 text-quiet">{formatDate(member.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            member.status === 'active'
                              ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                              : 'border border-red-300 bg-red-50 text-red-900'
                          }`}
                        >
                          {member.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={updatingId === member._id}
                          onClick={() => handleToggleStatus(member)}
                          className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-40 ${
                            member.status === 'active'
                              ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                              : 'border-green-300 bg-green-50 text-green-900 hover:bg-green-100'
                          }`}
                        >
                          {updatingId === member._id
                            ? 'Updating...'
                            : member.status === 'active'
                            ? 'Suspend Account'
                            : 'Reactivate'}
                        </button>
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
