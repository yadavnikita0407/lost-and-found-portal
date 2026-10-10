export default function ClaimStatusBadge({ status }) {
  const normStatus = (status || 'pending').toLowerCase()

  if (normStatus === 'approved') {
    return (
      <span className="border border-green-800 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-900">
        Approved
      </span>
    )
  }

  if (normStatus === 'rejected') {
    return (
      <span className="border border-red-800 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-900">
        Rejected
      </span>
    )
  }

  return (
    <span className="border border-rule bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-quiet">
      Pending Review
    </span>
  )
}
