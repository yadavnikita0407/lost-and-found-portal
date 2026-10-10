import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchItems } from '../api/itemsApi'
import { ITEM_CATEGORIES, ITEM_STATUSES } from '../utils/constants'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ItemGrid from '../components/items/ItemGrid'
import Pagination from '../components/common/Pagination'

export default function SearchItems() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })

  // Search filter states initialized from URL params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const reloadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: 9,
      }
      if (keyword.trim()) params.keyword = keyword.trim()
      if (type) params.type = type
      if (category) params.category = category
      if (status) params.status = status
      if (location.trim()) params.location = location.trim()

      const response = await fetchItems(params)
      setItems(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to retrieve registry records.')
    } finally {
      setLoading(false)
    }
  }, [keyword, type, category, status, location, page])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const params = {
          page,
          limit: 9,
        }
        if (keyword.trim()) params.keyword = keyword.trim()
        if (type) params.type = type
        if (category) params.category = category
        if (status) params.status = status
        if (location.trim()) params.location = location.trim()

        const response = await fetchItems(params)
        if (!ignore) {
          setItems(response.data || [])
          if (response.pagination) {
            setPagination(response.pagination)
          }
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || 'Unable to retrieve registry records.')
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
  }, [keyword, type, category, status, location, page])

  // Sync state to URL params
  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams()
    if (newParams.keyword) updated.set('keyword', newParams.keyword)
    if (newParams.type) updated.set('type', newParams.type)
    if (newParams.category) updated.set('category', newParams.category)
    if (newParams.status) updated.set('status', newParams.status)
    if (newParams.location) updated.set('location', newParams.location)
    if (newParams.page && newParams.page > 1) updated.set('page', String(newParams.page))
    setSearchParams(updated)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    updateUrlParams({ keyword, type, category, status, location, page: 1 })
  }

  const handleTypeChange = (newType) => {
    setType(newType)
    setPage(1)
    updateUrlParams({ keyword, type: newType, category, status, location, page: 1 })
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    setPage(1)
    updateUrlParams({ keyword, type, category: newCategory, status, location, page: 1 })
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
    updateUrlParams({ keyword, type, category, status: newStatus, location, page: 1 })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    updateUrlParams({ keyword, type, category, status, location, page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearFilters = () => {
    setKeyword('')
    setType('')
    setCategory('')
    setStatus('')
    setLocation('')
    setPage(1)
    setSearchParams({})
  }

  const isFiltered = Boolean(keyword || type || category || status || location)

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
              <span>Registry Search</span>
            </div>
            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                  Campus Property Registry
                </h1>
                <p className="mt-1 text-sm text-quiet">
                  Browse and cross-examine registered lost and found items cataloged across college departments.
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

        {/* Search & Filter Toolbar */}
        <div className="border-b border-rule bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                {/* Keyword search input */}
                <div className="relative sm:col-span-5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-quiet" aria-hidden="true">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="search"
                    placeholder="Search by item name, model, colour..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full border border-rule bg-surface py-2.5 pl-10 pr-4 text-xs font-sans text-ink placeholder-quiet transition-colors focus:border-lake focus:outline-none"
                  />
                </div>

                {/* Location input */}
                <div className="relative sm:col-span-3">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-quiet" aria-hidden="true">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Location or block..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-rule bg-surface py-2.5 pl-10 pr-4 text-xs font-sans text-ink placeholder-quiet transition-colors focus:border-lake focus:outline-none"
                  />
                </div>

                {/* Category select */}
                <div className="sm:col-span-2">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border border-rule bg-surface py-2.5 px-3 text-xs font-sans text-ink transition-colors focus:border-lake focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status select */}
                <div className="sm:col-span-2">
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full border border-rule bg-surface py-2.5 px-3 text-xs font-sans text-ink transition-colors focus:border-lake focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value={ITEM_STATUSES.ACTIVE}>Active</option>
                    <option value={ITEM_STATUSES.CLAIMED}>Claimed</option>
                    <option value={ITEM_STATUSES.RETURNED}>Returned</option>
                  </select>
                </div>
              </div>

              {/* Type toggle buttons & Clear action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1 border border-rule bg-paper p-0.5">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('')}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      type === '' ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-quiet hover:text-ink'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('lost')}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      type === 'lost' ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-quiet hover:text-ink'
                    }`}
                  >
                    Lost Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('found')}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      type === 'found' ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-quiet hover:text-ink'
                    }`}
                  >
                    Found Only
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-xs font-medium text-quiet hover:text-ink hover:underline"
                    >
                      Reset Filters
                    </button>
                  )}
                  <button
                    type="submit"
                    className="border border-bark bg-bark px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-surface transition-colors hover:bg-lake-deep"
                  >
                    Filter Registry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Registry Feed */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between text-xs text-quiet">
            <span>
              Showing {items.length} of {pagination.totalItems || items.length} logged records
            </span>
            {pagination.totalPages > 1 && (
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
            )}
          </div>

          {error ? (
            <div className="border border-rule bg-surface p-8 text-center">
              <p className="font-display text-base font-medium text-ink">{error}</p>
              <button
                type="button"
                onClick={reloadItems}
                className="mt-4 border border-rule bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-surface"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <ItemGrid
                items={items}
                loading={loading}
                emptyMessage="No registry items found matching your search criteria."
              />

              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
