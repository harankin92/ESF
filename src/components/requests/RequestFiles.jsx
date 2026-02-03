import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { FileText, Download, Trash2, Upload, X, File, Paperclip, Loader2 } from 'lucide-react';

export const RequestFiles = ({ requestId, canEdit }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const loadFiles = async () => {
        try {
            const data = await api.getRequestFiles(requestId);
            setFiles(data);
        } catch (err) {
            console.error('Failed to load files:', err);
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [requestId]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setError('');
        setUploading(true);

        try {
            await api.uploadRequestFile(requestId, file);
            await loadFiles();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.deleteRequestFile(fileId);
            setFiles(files.filter(f => f.id !== fileId));
        } catch (err) {
            setError(err.message);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) return <div className="text-center py-4 text-slate-500">Loading files...</div>;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Paperclip size={18} className="text-slate-500" />
                    Attachments ({files.length})
                </h3>
                {canEdit && (
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            Upload File
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-900/30 flex justify-between items-center">
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</span>
                    <button onClick={() => setError('')} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {files.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-600 text-sm italic">
                        No files uploaded yet.
                    </div>
                ) : (
                    files.map(file => (
                        <div key={file.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between group transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                    <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={file.filename}>
                                        {file.filename}
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                        {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <a
                                    href={api.downloadRequestFileUrl(file.id)}
                                    // download={file.filename} // Handled by backend content-disposition usually, but attribute helps
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download size={16} />
                                </a>
                                {canEdit && (
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
