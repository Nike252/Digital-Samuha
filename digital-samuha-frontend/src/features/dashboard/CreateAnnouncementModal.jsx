import { useState } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { Button, FormInput } from '../../components/ui'

const CreateAnnouncementModal = ({ isOpen, onClose, onSubmit, editingAnnouncement }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    display_from: '',
    display_until: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data when editing
  useState(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title || '',
        message: editingAnnouncement.message || '',
        display_from: editingAnnouncement.display_from || '',
        display_until: editingAnnouncement.display_until || '',
      })
    } else {
      setFormData({ title: '', message: '', display_from: '', display_until: '' })
    }
  }, [editingAnnouncement])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData, editingAnnouncement?.id)
      // Reset form and close modal
      setFormData({ title: '', message: '', display_from: '', display_until: '' })
      setErrors({})
      onClose()
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save announcement' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', message: '', display_from: '', display_until: '' })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g., Monthly Meeting Reminder"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
              placeholder="Dear all,&#10;&#10;Write your announcement message here...&#10;&#10;Thank you."
              required
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1">{errors.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Tip: Start with &quot;Dear all,&quot; and end with your signature for a professional notice.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display From (Optional)
            </label>
            <input
              type="date"
              name="display_from"
              value={formData.display_from}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to show immediately
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Until (Optional)
            </label>
            <input
              type="date"
              name="display_until"
              value={formData.display_until}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to show permanently
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (editingAnnouncement ? 'Updating...' : 'Posting...') : (editingAnnouncement ? 'Update Announcement' : 'Post Announcement')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

CreateAnnouncementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingAnnouncement: PropTypes.object,
}

export default CreateAnnouncementModal
