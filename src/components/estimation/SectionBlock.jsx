import { Plus, ChevronRight } from 'lucide-react';
import TaskRow from './TaskRow';

const SectionBlock = ({
    section,
    manualRoles,
    qaPercent,
    pmPercent,
    onAddTask,
    onUpdateEstimate,
    onUpdateInfo,
    onDeleteTask,
    onUpdateTitle,
    onToggleQA,
    onTogglePM
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors duration-200">
                <div className="flex items-center gap-2">
                    <ChevronRight size={18} className="text-indigo-500" />
                    <input
                        value={section.title}
                        onChange={(e) => onUpdateTitle(section.id, e.target.value)}
                        className="font-black bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 text-lg p-0 focus:outline-none w-full"
                    />
                </div>
                <button
                    onClick={() => onAddTask(section.id)}
                    className="text-xs flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all font-bold"
                >
                    <Plus size={14} /> Add Task
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                            <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest min-w-[300px]">Features & Scope</th>
                            {manualRoles.map(role => (
                                <th key={role.id} className="px-3 py-4 text-center border-l border-slate-100 dark:border-slate-800">
                                    <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mb-1 ${role.color}`}>
                                        {role.label}
                                    </div>
                                    <div className="flex justify-center gap-4 text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                                        <span>MIN</span>
                                        <span>MAX</span>
                                    </div>
                                </th>
                            ))}
                            {/* QA Column Header */}
                            <th className="px-3 py-4 text-center border-l border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-900/10">
                                <div className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mb-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                                    QA ({qaPercent}%)
                                </div>
                                <div className="flex justify-center gap-4 text-[9px] text-amber-400 dark:text-amber-600 font-bold">
                                    <span>MIN</span>
                                    <span>MAX</span>
                                </div>
                            </th>
                            {/* PM Column Header */}
                            <th className="px-3 py-4 text-center border-l border-slate-100 dark:border-slate-800 bg-teal-50/50 dark:bg-teal-900/10">
                                <div className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mb-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400">
                                    PM ({pmPercent}%)
                                </div>
                                <div className="flex justify-center gap-4 text-[9px] text-teal-400 dark:text-teal-600 font-bold">
                                    <span>MIN</span>
                                    <span>MAX</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 border-l border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-900/10 text-center">
                                <div className="text-[9px] font-black uppercase text-indigo-400 dark:text-indigo-500 tracking-widest mb-1">Total</div>
                                <div className="flex justify-center gap-4 text-[9px] text-indigo-300 dark:text-indigo-600 font-bold">
                                    <span>MIN</span>
                                    <span>MAX</span>
                                </div>
                            </th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {section.tasks.map((task) => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                sectionId={section.id}
                                manualRoles={manualRoles}
                                qaPercent={qaPercent}
                                pmPercent={pmPercent}
                                onUpdateEstimate={onUpdateEstimate}
                                onUpdateInfo={onUpdateInfo}
                                onDelete={onDeleteTask}
                                onToggleQA={onToggleQA}
                                onTogglePM={onTogglePM}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SectionBlock;
