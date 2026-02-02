import StatusBadge from '../common/StatusBadge';
import { Briefcase, Code2, Calendar, AlertTriangle, User } from 'lucide-react';

const RequestCard = ({ request, onClick }) => {
    return (
        <div
            onClick={() => onClick?.(request.id)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {request.client_name || 'Unknown Client'}
                    </h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium truncate">
                        {request.project_name || 'Untitled Project'}
                    </p>
                </div>
                <StatusBadge status={request.status} />
            </div>

            {request.rejection_reason && (request.status === 'Rejected' || request.status === 'Pending Estimation') && (
                <div className="flex items-start gap-2 p-2 mb-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                    <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium line-clamp-2">{request.rejection_reason}</p>
                </div>
            )}

            <div className="space-y-1.5">
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
                            <span>{request.creator_name}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestCard;
