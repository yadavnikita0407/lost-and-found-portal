export default function StatCard({ label, count, index = '01', subtext }) {
  return (
    <div className="border border-rule bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-semibold text-lake-deep" aria-hidden="true">
          {index}
        </span>
        {subtext && (
          <span className="text-[11px] font-medium text-quiet uppercase tracking-wider">
            {subtext}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {count}
      </p>
      <h3 className="mt-1 text-xs font-semibold uppercase tracking-wider text-quiet">
        {label}
      </h3>
    </div>
  )
}
