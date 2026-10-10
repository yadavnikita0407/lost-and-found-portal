import { useState } from 'react'
import { ITEM_CATEGORIES } from '../../utils/constants'

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function UploadIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}

export default function ItemForm({ type = 'lost', onSubmit, loading = false, error = null }) {
  const isLost = type === 'lost'

  const [form, setForm] = useState(() => ({
    name: '',
    category: ITEM_CATEGORIES[0],
    description: '',
    location: '',
    dateReported: new Date().toISOString().split('T')[0],
    colour: '',
    brand: '',
    uniqueDetails: '',
  }))

  const [photo, setPhoto] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, photo: 'File size must be under 5 MB' }))
        return
      }
      setPhoto(file)
      setPreviewUrl(URL.createObjectURL(file))
      setFieldErrors((prev) => ({ ...prev, photo: undefined }))
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Item title is required'
    if (!form.category) errs.category = 'Category is required'
    if (!form.location.trim()) errs.location = 'Campus location is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.trim().length < 10) errs.description = 'Provide at least 10 characters of description'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }

    const formData = new FormData()
    formData.append('type', type)
    formData.append('name', form.name.trim())
    formData.append('category', form.category)
    formData.append('description', form.description.trim())
    formData.append('location', form.location.trim())
    formData.append('dateReported', form.dateReported)
    if (form.colour.trim()) formData.append('colour', form.colour.trim())
    if (form.brand.trim()) formData.append('brand', form.brand.trim())
    if (form.uniqueDetails.trim()) formData.append('uniqueDetails', form.uniqueDetails.trim())
    if (photo) formData.append('photo', photo)

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {error && (
        <div role="alert" className="border-l-4 border-red-700 bg-red-50 p-4 text-xs text-red-900">
          <p className="font-semibold">Unable to submit report</p>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {/* Item Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-ink">
          Item Name / Title <span className="text-lake-deep">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          placeholder={isLost ? 'e.g. Graphing Calculator TI-84 Plus' : 'e.g. Blue Spiral College Notebook'}
          className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
        />
        {fieldErrors.name && <p className="text-xs text-red-700">{fieldErrors.name}</p>}
      </div>

      {/* Category & Location */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-ink">
            Category <span className="text-lake-deep">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
          >
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.category && <p className="text-xs text-red-700">{fieldErrors.category}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-ink">
            Campus Location <span className="text-lake-deep">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            required
            placeholder={isLost ? 'Where you last remember seeing it' : 'Where item was discovered on campus'}
            className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
          />
          {fieldErrors.location && <p className="text-xs text-red-700">{fieldErrors.location}</p>}
        </div>
      </div>

      {/* Date & Colour & Brand */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateReported" className="text-xs font-semibold uppercase tracking-wider text-ink">
            Date {isLost ? 'Lost' : 'Found'} <span className="text-lake-deep">*</span>
          </label>
          <input
            id="dateReported"
            name="dateReported"
            type="date"
            value={form.dateReported}
            onChange={handleChange}
            required
            className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="colour" className="text-xs font-semibold uppercase tracking-wider text-ink">
            Colour <span className="text-quiet text-xs font-normal">(optional)</span>
          </label>
          <input
            id="colour"
            name="colour"
            type="text"
            value={form.colour}
            onChange={handleChange}
            placeholder="e.g. Navy Blue, Silver"
            className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="brand" className="text-xs font-semibold uppercase tracking-wider text-ink">
            Brand / Make <span className="text-quiet text-xs font-normal">(optional)</span>
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            value={form.brand}
            onChange={handleChange}
            placeholder="e.g. Apple, Casio, Wildhorn"
            className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
          />
        </div>
      </div>

      {/* Detailed Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-ink">
          Detailed Description <span className="text-lake-deep">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          required
          placeholder="Describe physical condition, contents, visible markings, or stickers..."
          className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
        />
        {fieldErrors.description && <p className="text-xs text-red-700">{fieldErrors.description}</p>}
      </div>

      {/* Identifying Secret / Unique Details */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="uniqueDetails" className="text-xs font-semibold uppercase tracking-wider text-ink">
          Confidential Proof Details <span className="text-quiet text-xs font-normal">(Private)</span>
        </label>
        <input
          id="uniqueDetails"
          name="uniqueDetails"
          type="text"
          value={form.uniqueDetails}
          onChange={handleChange}
          placeholder="e.g. Serial number, lock combination, inside initials, cash amount inside wallet"
          className="border border-rule bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-quiet/50 focus:border-lake focus:outline-none focus:ring-1 focus:ring-lake/30"
        />
        <p className="text-[11px] text-quiet">
          This detail is masked from the public registry and only visible to administrative reviewers to verify ownership claims.
        </p>
      </div>

      {/* Photo Upload */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink">
          Item Photograph <span className="text-quiet text-xs font-normal">(optional, JPEG/PNG up to 5 MB)</span>
        </span>

        {previewUrl ? (
          <div className="relative inline-block w-48 border border-rule p-1 bg-surface">
            <img src={previewUrl} alt="Upload preview" className="aspect-[4/3] w-full object-cover" />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="mt-2 w-full border border-rule bg-paper py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-rule bg-surface p-6 text-center hover:border-quiet transition-colors">
            <UploadIcon className="text-quiet" />
            <span className="mt-2 text-xs font-semibold text-ink">
              Upload a photograph of the item
            </span>
            <span className="mt-0.5 text-[11px] text-quiet">
              PNG, JPG, WebP up to 5 MB
            </span>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}
        {fieldErrors.photo && <p className="text-xs text-red-700">{fieldErrors.photo}</p>}
      </div>

      {/* Submit Button */}
      <div className="mt-2 flex items-center justify-end gap-3 border-t border-rule pt-5">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-bark px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ink disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner />
              <span>Submitting report…</span>
            </>
          ) : (
            <span>Publish {isLost ? 'Lost' : 'Found'} Report</span>
          )}
        </button>
      </div>
    </form>
  )
}
