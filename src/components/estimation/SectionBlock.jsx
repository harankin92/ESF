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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChevronRight size={18} className="text-indigo-500" />
                    <input
                        value={section.title}
                        onChange={(e) => onUpdateTitle(section.id, e.target.value)}
                        className="font-black bg-transparent border-none focus:ring-0 text-slate-800 text-lg p-0 focus:outline-none"
                    />
                </div>
                <button
                    onClick={() => onAddTask(section.id)}
                    className="text-xs flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-all font-bold"
                >
                    <Plus size={14} /> Add Task
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30">
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest min-w-[300px]">Features & Scope</th>
                            {manualRoles.map(role => (
                                <th key={role.id} className="px-3 py-4 text-center border-l border-slate-100">
                                    <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mb-1 ${role.color}`}>
                                        {role.label}
                                    </div>
                                    <div className="flex justify-center gap-4 text-[9px] text-slate-400 font-bold">
                                        <span>MIN</span>
                                        <span>MAX</span>
                                    </div>
                                </th>
                            ))}
                            {/* QA Column Header */}
                            <th className="px-3 py-4 text-center border-l border-slate-100 bg-amber-50/50">
                                <div className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mb-1 bg-amber-100 text-amber-700">
                                    QA ({qaPercent}%)
                                </div>
                                <div className="flex justify-center gap-4 text-[9px] text-amber-400 font-bold">
                                    <span>MIN</span>
                                    <span>MAX</span>
                                </div>
                            </th>
                            {/* PM Column Header */}
                            <th className="px-3 py-4 text-center border-l border-slate-100 bg-teal-50/50">
                                <div className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mb-1 bg-teal-100 text-teal-700">
                                    PM ({pmPercent}%)
                                </div>
                                <div className="flex justify-center gap-4 text-[9px] text-teal-400 font-bold">
                                    <span>MIN</span>
                                    <span>MAX</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 border-l border-slate-100 bg-indigo-50/30 text-center">
                                <div className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1">Total</div>
                                <div className="flex justify-center gap-4 text-[9px] text-indigo-300 font-bold">
                                    <span>MIN</span>
                                    <span>MAX</span>
                                </div>
                            </th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
