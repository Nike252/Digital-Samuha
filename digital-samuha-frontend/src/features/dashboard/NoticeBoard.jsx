import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Plus, Megaphone } from 'lucide-react'
import { Button } from '../../components/ui'
import { useUI } from '../../context/UIContext'
import AnnouncementCard from './AnnouncementCard'
import CreateAnnouncementModal from './CreateAnnouncementModal'
import { announcementsAPI } from '../../utils/api'

const NoticeBoard = ({ userRole, currentUserId }) => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const { showToast, showConfirm } = useUI()

  // Check if user can create announcements
  const canCreate = ['adhakshya', 'co_adhakshya'].includes(userRole)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await announcementsAPI.list()
      setAnnouncements(response.data)
      setError('')
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError(err.message || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async (formData, announcementId) => {
    try {
      if (announcementId) {
        // Update existing
        await announcementsAPI.update(announcementId, {
          ...formData,
          is_active: true,
        })
      } else {
        // Create new
        await announcementsAPI.create({
          ...formData,
          is_active: true,
        })
      }
      // Refresh the list
      await fetchAnnouncements()
      setEditingAnnouncement(null)
      showToast(announcementId ? 'Announcement updated' : 'Announcement created', 'success')
      return Promise.resolve()
    } catch (err) {
      console.error('Error saving announcement:', err)
      showToast(err.message || 'Failed to save announcement', 'error')
      throw new Error(err.message || 'Failed to save announcement')
    }
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setIsModalOpen(true)
  }

  const handleDelete = async (announcementId) => {
    showConfirm({
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await announcementsAPI.delete(announcementId)
          await fetchAnnouncements()
          showToast('Announcement deleted successfully', 'success')
        } catch (err) {
          console.error('Error deleting announcement:', err)
          showToast(err.message || 'Failed to delete announcement', 'error')
        }
      }
    });
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAnnouncement(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Megaphone size={24} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notice Board</h2>
            <p className="text-sm text-gray-500">Important announcements and updates</p>
          </div>
        </div>
        
        {canCreate && (
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={20} />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2 text-4xl">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">Error Loading Announcements</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={fetchAnnouncements}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-4">
              <Megaphone size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 font-semibold mb-2">No announcements yet</p>
            <p className="text-sm text-gray-500 mb-2">
              {canCreate 
                ? 'Click "Create Announcement" above to post your first notice' 
                : 'No announcements visible to you at this time'}
            </p>

          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              // Check if current user can manage this announcement
              const canManage = canCreate && announcement.created_by === currentUserId
              
              return (
                <AnnouncementCard 
                  key={announcement.id} 
                  announcement={announcement}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canManage={canManage}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateAnnouncement}
        editingAnnouncement={editingAnnouncement}
      />
    </div>
  )
}

NoticeBoard.propTypes = {
  userRole: PropTypes.string.isRequired,
  currentUserId: PropTypes.number,
}

export default NoticeBoard
