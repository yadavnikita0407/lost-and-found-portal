export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav
      className="flex items-center justify-between border-t border-rule bg-surface px-4 py-3 sm:px-6 mt-8"
      aria-label="Pagination"
    >
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="border border-rule bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="flex items-center px-3 text-xs text-quiet font-medium">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="border border-rule bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </nav>
  )
}
