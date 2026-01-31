import StatusBadge from '../common/StatusBadge';
import { Calendar, User, FolderKanban } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
    return (
        <div
            onClick={() => onClick?.(project.id)}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <FolderKanban size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {project.client_name}
                        </h3>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            Project #{project.id}
                        </span>
                    </div>
                </div>
                <StatusBadge status={project.status} size="xs" />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4">
                {project.pm_name && (
                    <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{project.pm_name}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
