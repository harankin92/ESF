import StatusBadge from '../common/StatusBadge';
import { Briefcase, Code2, Calendar, AlertTriangle, User, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RequestCard = ({ request, onClick, onDelete }) => {
    const { user } = useAuth();

    const canDelete = user?.role === 'Admin' || (user?.role === 'Sale' && request.created_by === user?.id);
    const isConverted = request.status === 'Contract' || request.status === 'Converted';

    return (
        <div
            onClick={() => onClick?.(request.id)}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer relative"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate pr-2">
                        {request.project_name || 'Untitled Project'} | {request.client_name || 'Unknown Client'}
                    </h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={request.status} />
                    {request.priority && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${request.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                            {request.priority}
                        </span>
                    )}
                </div>
            </div>

            {request.rejection_reason && (request.status === 'Rejected' || request.status === 'Pending Estimation') && (
                <div className="flex items-start gap-2 p-2 mb-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                    <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium line-clamp-2">{request.rejection_reason}</p>
                </div>
            )}

            <div className="flex items-end justify-between">
                <div className="space-y-1.5 flex-1 min-w-0">
                    {request.work_type && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Briefcase size={12} />
                            <span>{request.work_type}</span>
                            {request.cooperation_model && <span className="text-slate-400">• {request.cooperation_model}</span>}
                        </div>
                    )}
                    {request.tech_stack && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Code2 size={12} />
                            <span className="truncate">{request.tech_stack}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <Calendar size={12} />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        {request.creator_name && (
                            <>
                                <span>•</span>
                                <User size={12} />
                                <span className="truncate">{request.creator_name}</span>
                            </>
                        )}
                    </div>
                </div>

                {canDelete && !isConverted && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(request.id);
                        }}
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all ml-4"
                        title="Delete Request"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default RequestCard;
