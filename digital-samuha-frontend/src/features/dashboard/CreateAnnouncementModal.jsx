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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Background Glows (Subtler for better readability) */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-white/40 border-b border-gray-200/20 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </h2>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-1">
              {editingAnnouncement ? 'Refine your notice' : 'Post to the community board'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 bg-gray-900/5 hover:bg-gray-900/10 rounded-2xl transition-all hover:rotate-90 text-gray-700 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-8 text-gray-900">
            {errors.submit && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-black text-rose-600">
                {errors.submit}
              </div>
            )}

            <div className="space-y-6">
              <div className="group">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-3 ml-1">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Monthly Meeting Reminder"
                    className="w-full px-5 h-14 rounded-2xl bg-white/60 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-bold placeholder:text-gray-400"
                    required
                />
                {errors.title && <p className="text-[10px] text-rose-500 font-black mt-2 ml-1">{errors.title}</p>}
              </div>

              <div className="group">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-3 ml-1">
                  Announcement Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-5 py-4 rounded-[1.5rem] bg-white/60 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none text-gray-900 font-bold placeholder:text-gray-400 leading-relaxed"
                  placeholder="Dear all,&#10;&#10;Write your announcement message here...&#10;&#10;Thank you."
                  required
                />
                <div className="flex items-center justify-between mt-3 px-1">
                   <p className="text-[11px] text-gray-600 font-bold">
                    💡 Tip: Start with "Dear all" for a professional tone.
                  </p>
                  {errors.message && (
                    <p className="text-[10px] text-rose-500 font-black">{errors.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-widest ml-1">
                    Display From
                  </label>
                  <input
                    type="date"
                    name="display_from"
                    value={formData.display_from}
                    onChange={handleChange}
                    className="w-full px-5 h-14 rounded-2xl bg-white/60 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-sm font-black text-gray-800"
                  />
                  <p className="text-[10px] text-gray-500 font-bold ml-1">Leave blank for immediate</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-widest ml-1">
                    Display Until
                  </label>
                  <input
                    type="date"
                    name="display_until"
                    value={formData.display_until}
                    onChange={handleChange}
                    className="w-full px-5 h-14 rounded-2xl bg-white/60 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-sm font-black text-gray-800"
                  />
                  <p className="text-[10px] text-gray-500 font-bold ml-1">Leave blank for permanent</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-xs border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-95 shadow-sm"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-indigo-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (editingAnnouncement ? 'Update Notice' : 'Post Announcement')}
              </Button>
            </div>
          </form>
        </div>
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
