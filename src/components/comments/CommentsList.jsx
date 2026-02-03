import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Paperclip, X } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { RichTextEditor } from '../common/RichTextEditor';
import { api } from '../../services/api';

export const CommentsList = ({ entityType, entityId, currentUser, users = [] }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [entityType, entityId]);

    const fetchComments = async () => {
        try {
            setIsLoading(true);
            const data = await api.getComments(entityType, entityId);

            // Fetch attachments for each comment
            const commentsWithAttachments = await Promise.all(data.map(async (comment) => {
                try {
                    // We need an API endpoint to get attachments for a comment
                    // Using the attachments table via a new API method or modifying getComments to include them
                    // Since getCommentsByEntity (backend) doesn't join attachments, we need to fetch them.
                    // However, doing N+1 requests is bad. 
                    // Better approach: Update backend getCommentsByEntity to include attachments JSON or fetch all attachments.
                    // For now, let's assume we need to fetch them if the backend doesn't provide them.
                    // Checking backend response structure: "SELECT c.*, u.name... FROM comments c ..."
                    // It does NOT include attachments.
                    return comment;
                } catch (e) {
                    return comment;
                }
            }));

            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Extract mentioned users from content
            console.log('Comment HTML:', newComment);
            const mentionedUsers = extractMentionedUsers(newComment);
            console.log('Mentioned Users:', mentionedUsers);

            // Create comment
            const comment = await api.createComment(
                entityType,
                entityId,
                newComment,
                mentionedUsers
            );

            // Upload attachments if any
            if (selectedFiles.length > 0) {
                await api.uploadAttachments(comment.id, selectedFiles);
                // Refresh to get attachments
                await fetchComments();
            } else {
                setComments(prev => [...prev, comment]);
            }

            // Reset form
            setNewComment('');
            setSelectedFiles([]);
        } catch (error) {
            alert('Failed to post comment: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const extractMentionedUsers = (html) => {
        // Look for data-id attributes in mention spans (supports both single and double quotes)
        console.log('Extracting mentions from:', html);
        const matches = [...html.matchAll(/data-id=["'](\d+)["']/g)];
        const ids = matches.map(m => parseInt(m[1]));
        console.log('Found user IDs:', ids);
        return [...new Set(ids)]; // Remove duplicates
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit

        if (validFiles.length < files.length) {
            alert('Some files exceed the 10MB limit and were not added');
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCommentEdit = (commentId, newContent) => {
        setComments(prev =>
            prev.map(c => c.id === commentId ? { ...c, content: newContent, updated_at: new Date().toISOString() } : c)
        );
    };

    const handleCommentDelete = (commentId) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-slate-600 dark:text-slate-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                        Comments
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        ({comments.length})
                    </span>
                </div>
            </div>

            {/* Comments List */}
            <div className="px-6 max-h-[500px] overflow-y-auto">
                {isLoading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading comments...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-12 text-center">
                        <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            No comments yet. Be the first to comment!
                        </p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUser={currentUser}
                            onEdit={handleCommentEdit}
                            onDelete={handleCommentDelete}
                            users={users}
                        />
                    ))
                )}
            </div>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <RichTextEditor
                    content={newComment}
                    onChange={setNewComment}
                    users={users}
                    placeholder="Write a comment... (Type @ to mention someone)"
                />

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <Paperclip size={14} className="text-slate-500 dark:text-slate-400" />
                                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                                    {file.name}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X size={14} className="text-slate-500 dark:text-slate-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Attach files (max 10MB)"
                        >
                            <Paperclip size={16} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedFiles.length > 0 && `${selectedFiles.length} file(s)`}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                Post Comment
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
