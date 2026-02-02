import { User, Calendar, ArrowRight, Trash2, MapPin, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const sourceColors = {
    'Upwork': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'LinkedIn': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Website': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Referral': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Other': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
};

const LeadCard = ({ lead, onOpen, onDelete }) => {
    const { user } = useAuth();

    const canEdit = () => {
        if (user?.role === 'Admin') return true;
        if (user?.role === 'Sale' && lead.created_by === user?.id) return true;
        return false;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md dark:hover:border-slate-700 transition-all group flex flex-col">
            <div className="p-6 flex-1">
                {/* Source Badge & ID */}
                <div className="flex items-center justify-between mb-3">
                    {lead.source ? (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${sourceColors[lead.source] || sourceColors['Other']}`}>
                            {lead.source}
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            No Source
                        </span>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        #{lead.id}
                    </span>
                </div>

                {/* Client Name */}
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 truncate" title={lead.client_name}>
                    {lead.client_name}
                </h3>

                {/* Company */}
                {lead.company && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 truncate">
                        {lead.company}
                    </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-4">
                    <User size={12} />
                    <span>{lead.creator_name}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <Calendar size={12} />
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {lead.timezone && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                            <div className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black mb-0.5">Timezone</div>
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                {lead.timezone}
                            </div>
                        </div>
                    )}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2.5 text-center">
                        <div className="text-[9px] uppercase text-indigo-400 dark:text-indigo-500 font-black mb-0.5">Requests</div>
                        <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            {lead.request_count || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                <button
                    onClick={() => onOpen(lead.id)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                    Open Lead
                    <ArrowRight size={14} />
                </button>

                {onDelete && canEdit() && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this lead?')) {
                                onDelete(lead.id);
                            }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default LeadCard;
