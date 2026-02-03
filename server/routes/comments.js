import express from 'express';
import {
    insertComment,
    getCommentsByEntity,
    updateComment,
    deleteComment,
    insertAttachment,
    deleteAttachment,
    queryOne,
    insertNotification
} from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import { sendNotificationToUser } from '../socket.js';

const router = express.Router();

// GET /api/comments/:entityType/:entityId - Get all comments for an entity
router.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;

        if (!['request', 'estimate'].includes(entityType)) {
            return res.status(400).json({ error: 'Invalid entity type' });
        }

        const comments = getCommentsByEntity(entityType, parseInt(entityId));

        // Fetch attachments for each comment
        // Import getAttachmentsByComment here as we need it
        const { getAttachmentsByComment } = await import('../db.js');

        const commentsWithAttachments = comments.map(comment => {
            const attachments = getAttachmentsByComment(comment.id);
            return { ...comment, attachments };
        });

        res.json(commentsWithAttachments);
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// POST /api/comments - Create a new comment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { entityType, entityId, content, mentionedUsers } = req.body;

        if (!entityType || !entityId || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['request', 'estimate'].includes(entityType)) {
            return res.status(400).json({ error: 'Invalid entity type' });
        }

        const comment = insertComment(
            entityType,
            parseInt(entityId),
            req.user.id,
            content,
            mentionedUsers
        );

        // Create notifications for mentioned users
        if (mentionedUsers && Array.isArray(mentionedUsers) && mentionedUsers.length > 0) {
            // Import io from index.js
            const { io } = await import('../index.js');

            for (const userId of mentionedUsers) {
                if (userId !== req.user.id) {
                    const notification = insertNotification(
                        userId,
                        'mention',
                        entityType,
                        parseInt(entityId),
                        `${req.user.name} mentioned you in a comment`
                    );

                    // Send real-time notification via WebSocket
                    sendNotificationToUser(io, userId, notification);
                }
            }
        }

        // Notify entity participants about new comment
        if (entityType === 'request') {
            const request = queryOne("SELECT created_by, assigned_techlead, assigned_presale, project_name FROM requests WHERE id = ?", [parseInt(entityId)]);
            if (request) {
                const participants = new Set([request.created_by, request.assigned_techlead, request.assigned_presale].filter(id => id && id !== req.user.id));

                // Exclude mentioned users to avoid double notification
                if (mentionedUsers && Array.isArray(mentionedUsers)) {
                    mentionedUsers.forEach(id => participants.delete(id));
                }

                const { io } = await import('../index.js');
                const notificationMessage = `New comment on request "${request.project_name || 'Untitled'}"`;

                participants.forEach(userId => {
                    const notification = insertNotification(
                        userId,
                        'comment',
                        entityType,
                        parseInt(entityId),
                        notificationMessage
                    );
                    sendNotificationToUser(io, userId, notification);
                });
            }
        }

        if (entityType === 'estimate') {
            const estimate = queryOne("SELECT created_by, name FROM estimates WHERE id = ?", [parseInt(entityId)]);
            if (estimate && estimate.created_by && estimate.created_by !== req.user.id) {
                // Exclude mentioned users
                if (!mentionedUsers || !mentionedUsers.includes(estimate.created_by)) {
                    const { io } = await import('../index.js');
                    const notificationMessage = `New comment on estimate "${estimate.name || 'Untitled'}"`;
                    const notification = insertNotification(
                        estimate.created_by,
                        'comment',
                        entityType,
                        parseInt(entityId),
                        notificationMessage
                    );
                    sendNotificationToUser(io, estimate.created_by, notification);
                }
            }
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// PUT /api/comments/:id - Update a comment
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const { content } = req.body;
        const commentId = parseInt(req.params.id);

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Verify comment ownership
        const existing = queryOne('SELECT * FROM comments WHERE id = ?', [commentId]);
        if (!existing) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (existing.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to edit this comment' });
        }

        const updated = updateComment(commentId, content);
        res.json(updated);
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const commentId = parseInt(req.params.id);

        // Verify comment ownership
        const existing = queryOne('SELECT * FROM comments WHERE id = ?', [commentId]);
        if (!existing) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (existing.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        deleteComment(commentId);
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// POST /api/comments/:id/attachments - Upload files to a comment
router.post('/:id/attachments', authenticateToken, upload.array('files', 5), handleUploadError, (req, res) => {
    try {
        const commentId = parseInt(req.params.id);

        // Verify comment exists and belongs to user
        const comment = queryOne('SELECT * FROM comments WHERE id = ?', [commentId]);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to add attachments to this comment' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const attachments = [];
        for (const file of req.files) {
            const attachment = insertAttachment(
                commentId,
                file.originalname,
                null, // filepath is null for database storage
                file.size,
                file.mimetype,
                file.buffer // Store file data as BLOB
            );
            attachments.push(attachment);
        }

        res.status(201).json({ attachments });
    } catch (error) {
        console.error('Upload attachment error:', error);
        res.status(500).json({ error: 'Failed to upload attachments' });
    }
});

// GET /api/attachments/:id/download - Download an attachment
router.get('/attachments/:id/download', authenticateToken, (req, res) => {
    try {
        const attachmentId = parseInt(req.params.id);

        const attachment = queryOne('SELECT * FROM attachments WHERE id = ?', [attachmentId]);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }

        if (!attachment.file_data) {
            return res.status(404).json({ error: 'File data not found' });
        }

        // Set appropriate headers
        res.setHeader('Content-Type', attachment.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
        res.setHeader('Content-Length', attachment.filesize);

        // Send the BLOB data
        res.send(Buffer.from(attachment.file_data));
    } catch (error) {
        console.error('Download attachment error:', error);
        res.status(500).json({ error: 'Failed to download attachment' });
    }
});

// DELETE /api/attachments/:id - Delete an attachment
router.delete('/attachments/:id', authenticateToken, (req, res) => {
    try {
        const attachmentId = parseInt(req.params.id);

        // Verify comment ownership via attachment
        const attachment = queryOne(`
      SELECT a.*, c.user_id
      FROM attachments a
      JOIN comments c ON a.comment_id = c.id
      WHERE a.id = ?
    `, [attachmentId]);

        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }

        if (attachment.user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to delete this attachment' });
        }

        deleteAttachment(attachmentId);
        // TODO: Delete actual file from S3/storage

        res.json({ message: 'Attachment deleted' });
    } catch (error) {
        console.error('Delete attachment error:', error);
        res.status(500).json({ error: 'Failed to delete attachment' });
    }
});

export default router;
