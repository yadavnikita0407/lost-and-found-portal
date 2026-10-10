import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatDate'

function MapPinIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CalendarIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function CategoryIcon({ category, className = 'h-8 w-8 text-quiet/60' }) {
  // Clean minimal monochrome category icons
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {category === 'Electronics' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      ) : category === 'Keys' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      ) : category === 'ID & Documents' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      ) : category === 'Books & Stationery' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      )}
    </svg>
  )
}

export default function ItemCard({ item }) {
  const isLost = item.type === 'lost'
  const isReturned = item.status === 'returned'

  return (
    <article className="flex flex-col border border-rule bg-surface transition-colors hover:border-quiet/80">
      {/* Top Banner / Image Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-rule bg-paper flex items-center justify-center">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
            <CategoryIcon category={item.category} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-quiet">
              {item.category}
            </span>
          </div>
        )}

        {/* Type Badge */}
        <span
          className={`absolute left-3 top-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isLost ? 'bg-bark text-white' : 'bg-lake-deep text-white'
          }`}
        >
          {item.type}
        </span>

        {/* Status indicator */}
        {isReturned ? (
          <span className="absolute right-3 top-3 border border-green-800 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-900">
            Returned
          </span>
        ) : (
          <span className="absolute right-3 top-3 border border-rule bg-surface/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-quiet">
            {item.status}
          </span>
        )}
      </div>

      {/* Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-lake-deep">
            <span>{item.category}</span>
            {item.brand && (
              <>
                <span className="text-rule" aria-hidden="true">•</span>
                <span className="text-quiet">{item.brand}</span>
              </>
            )}
          </div>

          <h3 className="mt-1.5 font-display text-base font-medium tracking-tight text-ink line-clamp-1">
            <Link
              to={`/items/${item._id}`}
              className="hover:text-lake-deep transition-colors"
            >
              {item.name}
            </Link>
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-quiet line-clamp-2">
            {item.description || 'No description provided.'}
          </p>
        </div>

        {/* Metadata & Footer actions */}
        <div className="mt-4 border-t border-rule/70 pt-3">
          <div className="flex flex-col gap-1 text-[11px] text-quiet">
            <div className="flex items-center gap-1.5 truncate">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-bark" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-quiet" />
              <span>{formatDate(item.dateReported || item.createdAt)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-1">
            <Link
              to={`/items/${item._id}`}
              className="text-xs font-semibold text-lake-deep underline-offset-4 hover:underline"
            >
              View details →
            </Link>
            {!isLost && !isReturned && (
              <Link
                to={`/items/${item._id}`}
                className="border border-bark bg-white px-2.5 py-1 text-[11px] font-semibold text-bark transition-colors hover:bg-bark hover:text-white"
              >
                Claim Item
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
