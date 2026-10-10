const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-rule bg-bark text-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xl font-medium tracking-tight">
            Lost &amp; Found
          </p>
          <p className="mt-1 max-w-sm text-sm text-paper/70">
            Campus portal for authorized students and staff. Academic use
            only.
          </p>
        </div>
        <p className="text-sm text-paper/55">
          &copy; {CURRENT_YEAR} College Lost &amp; Found Portal
        </p>
      </div>
    </footer>
  )
}
