import PropTypes from 'prop-types'
import { Edit2, Trash2 } from 'lucide-react'

const AnnouncementCard = ({ announcement, onEdit, onDelete, canManage }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition-shadow relative group">
      {/* Edit/Delete Buttons (show on hover if user can manage) */}
      {canManage && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(announcement)}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            title="Edit announcement"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(announcement.id)}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete announcement"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Message Body */}
      <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-4 pr-20">
        {announcement.message}
      </div>
      
      {/* Footer: Author and Date */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-600 font-medium">
          - {announcement.created_by_name}
        </span>
        <span className="text-xs text-gray-400">
          {announcement.time_ago}
        </span>
      </div>
    </div>
  )
}

AnnouncementCard.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    created_by_name: PropTypes.string.isRequired,
    time_ago: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canManage: PropTypes.bool,
}

export default AnnouncementCard
