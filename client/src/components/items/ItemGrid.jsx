import ItemCard from './ItemCard'

function SkeletonCard() {
  return (
    <div className="flex flex-col border border-rule bg-surface p-0 animate-pulse">
      <div className="aspect-[16/10] w-full bg-paper" />
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="h-3 w-20 bg-paper" />
        <div className="h-5 w-40 bg-paper" />
        <div className="h-3 w-full bg-paper" />
        <div className="h-3 w-2/3 bg-paper" />
        <div className="mt-2 h-4 w-28 bg-paper" />
      </div>
    </div>
  )
}

export default function ItemGrid({ items = [], loading = false, emptyMessage = 'No items found matching the selected criteria.' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="border border-dashed border-rule bg-surface p-12 text-center">
        <svg
          className="mx-auto h-10 w-10 text-quiet/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="mt-3 font-display text-base font-medium text-ink">
          {emptyMessage}
        </p>
        <p className="mt-1 text-xs text-quiet">
          Try clearing filters or check back later as new reports are filed.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  )
}
