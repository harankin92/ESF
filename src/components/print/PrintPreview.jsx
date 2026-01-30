import { useState } from 'react';
import { X, Printer, Share2, Check, Link as LinkIcon, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReportContent from './ReportContent';
import { api } from '../../services/api';

const PrintPreview = (props) => {
    const { isOpen, onClose, onPrint, estimateId, discount } = props;
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharedUrl, setSharedUrl] = useState('');

    if (!isOpen) return null;

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    const handleShare = async () => {
        if (!estimateId) return;
        setSharing(true);
        try {
            const res = await api.shareEstimate(estimateId);
            const url = `${window.location.protocol}//${window.location.host}/share/${res.share_uuid}`;
            setSharedUrl(url);

            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch (clipErr) {
                console.warn('Clipboard access denied, user must copy manually', clipErr);
            }
        } catch (err) {
            console.error('Share error:', err);
            // Optionally show error toast
        } finally {
            setSharing(false);
        }
    };

    return (
        <>
            {/* Screen Preview (Modal) */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 screen-only">
                <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-black text-slate-800">Export Preview</h2>
                            <p className="text-xs text-slate-400">Review before exporting to PDF</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                        <ReportContent {...props} />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0">
                        <div>
                            {estimateId ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleShare}
                                        disabled={sharing || copied}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm ${copied
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : sharedUrl
                                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                            }`}
                                    >
                                        {sharing ? <Loader2 size={16} className="animate-spin" /> :
                                            copied ? <Check size={16} /> : <Share2 size={16} />}
                                        {copied ? 'Copied!' : sharedUrl ? 'Generate New Link' : 'Share Public Link'}
                                    </button>

                                    {sharedUrl && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                                            <LinkIcon size={14} className="text-slate-400" />
                                            <input
                                                readOnly
                                                value={sharedUrl}
                                                className="bg-transparent text-xs font-mono text-slate-600 w-64 outline-none select-all"
                                                onClick={(e) => e.target.select()}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic px-2">
                                    Save estimate to enable sharing
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-100 transition-all"
                            >
                                <Printer size={18} />
                                Print / Save PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Version (Portal) */}
            {createPortal(
                <div className="print-only">
                    <ReportContent {...props} />
                </div>,
                document.getElementById('print-root') || document.body
            )}
        </>
    );
};

export default PrintPreview;
