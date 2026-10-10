import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createItem } from '../api/itemsApi'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ItemForm from '../components/items/ItemForm'

export default function ReportFound() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    setError(null)
    try {
      await createItem(formData)
      navigate('/my-reports', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit found item report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="border-b border-rule bg-surface py-8">
          <div className="mx-auto max-w-4xl px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lake-deep">
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <span className="text-rule" aria-hidden="true">/</span>
              <span>Report Found Property</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Report a Found Item
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-quiet">
              Record an unattended or recovered item found on campus. You may surrender it to campus security desk or log it here to help the rightful owner identify and claim it.
            </p>
          </div>
        </section>

        {/* Content Form Area */}
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="border border-rule bg-surface p-6 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <ItemForm
              type="found"
              onSubmit={handleSubmit}
              loading={submitting}
              error={error}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
