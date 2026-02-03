import { useState } from 'react';
import { MessageSquare, Paperclip, Download, X, Edit2, Save } from 'lucide-react';
import { RichTextEditor } from '../common/RichTextEditor';
import { api } from '../../services/api';

export const CommentItem = ({ comment, currentUser, onEdit, onDelete, users = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isOwner = currentUser && comment.user_id === currentUser.id;
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const canEdit = isOwner || isAdmin;
    const canDelete = isOwner || isAdmin;

    const handleSaveEdit = async () => {
        if (!editContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.updateComment(comment.id, editContent);
            onEdit?.(comment.id, editContent);
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update comment: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditContent(comment.content);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await api.deleteComment(comment.id);
            onDelete?.(comment.id);
        } catch (error) {
            alert('Failed to delete comment: ' + error.message);
        }
    };

    const handleDownloadAttachment = async (attachment) => {
        try {
            const blob = await api.downloadAttachment(attachment.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to download attachment: ' + error.message);
        }
    };

    const getTimeSince = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const seconds = Math.floor((now - time) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return time.toLocaleDateString();
    };

    return (
        <div className="flex gap-3 py-4 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {(comment.user_name || 'U')[0].toUpperCase()}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                            {comment.user_name || 'Unknown User'}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                            {getTimeSince(comment.created_at)}
                            {comment.updated_at !== comment.created_at && ' (edited)'}
                        </span>
                    </div>

                    {/* Actions */}
                    {canEdit && (
                        <div className="flex items-center gap-1">
                            {!isEditing && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={14} className="text-slate-500 dark:text-slate-400" />
                                    </button>
                                    {canDelete && (
                                        <button
                                            onClick={handleDelete}
                                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                            title="Delete"
                                        >
                                            <X size={14} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Comment Content */}
                {isEditing ? (
                    <div className="space-y-2">
                        <RichTextEditor
                            content={editContent}
                            onChange={setEditContent}
                            users={users}
                            placeholder="Edit comment..."
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveEdit}
                                disabled={!editContent.trim() || isSubmitting}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <Save size={14} />
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="text-sm text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                )}

                {/* Attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {comment.attachments.map(attachment => (
                            <div
                                key={attachment.id}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg group"
                            >
                                <Paperclip size={14} className="text-slate-500 dark:text-slate-400" />
                                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                                    {attachment.filename}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {(attachment.filesize / 1024).toFixed(1)} KB
                                </span>
                                <button
                                    onClick={() => handleDownloadAttachment(attachment)}
                                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Download"
                                >
                                    <Download size={14} className="text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
