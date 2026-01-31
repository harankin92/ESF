import { Clock, User, DollarSign, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
    'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Pending Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Reviewing': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Pending Estimation': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Estimated': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
};

const LeadCard = ({ lead, onOpen, onDelete }) => {
    const { canEditLead } = useAuth();
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md dark:hover:border-slate-700 transition-all group flex flex-col">
            <div className="p-6 flex-1">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${statusColors[lead.status] || statusColors['New']}`}>
                        {lead.status}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        #{lead.id}
                    </span>
                </div>

                {/* Client Name */}
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 truncate" title={lead.client_name}>
                    {lead.client_name}
                </h3>

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
                    {lead.budget && (
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-2.5 text-center">
                            <div className="text-[9px] uppercase text-emerald-400 dark:text-emerald-500 font-black mb-0.5">Budget</div>
                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">
                                {lead.budget}
                            </div>
                        </div>
                    )}
                    {lead.deadline && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                            <div className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black mb-0.5">Deadline</div>
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                {new Date(lead.deadline).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                    {lead.work_type && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center col-span-2">
                            <div className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black mb-0.5">Work Type</div>
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                {lead.work_type}
                            </div>
                        </div>
                    )}
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

                {onDelete && canEditLead(lead) && (
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
