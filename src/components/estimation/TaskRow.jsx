import { Trash2 } from 'lucide-react';

const TaskRow = ({ task, sectionId, manualRoles, qaPercent, pmPercent, onUpdateEstimate, onUpdateInfo, onDelete, onToggleQA, onTogglePM }) => {
    const rowMin = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.min || 0), 0);
    const rowMax = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.max || 0), 0);

    // QA/PM calculations per task
    const includeQA = task.includeQA !== false; // default true
    const includePM = task.includePM !== false; // default true

    const qaMin = includeQA ? Math.round(rowMin * qaPercent / 100) : 0;
    const qaMax = includeQA ? Math.round(rowMax * qaPercent / 100) : 0;
    const pmMin = includePM ? Math.round(rowMin * pmPercent / 100) : 0;
    const pmMax = includePM ? Math.round(rowMax * pmPercent / 100) : 0;

    const totalMin = rowMin + qaMin + pmMin;
    const totalMax = rowMax + qaMax + pmMax;

    return (
        <tr className="hover:bg-slate-50/30 group transition-all">
            <td className="px-6 py-5">
                <input
                    placeholder="Task title..."
                    value={task.name}
                    onChange={(e) => onUpdateInfo(sectionId, task.id, 'name', e.target.value)}
                    className="block w-full font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-800 placeholder:text-slate-300 focus:outline-none"
                />
                <textarea
                    placeholder="Add technical details..."
                    rows="1"
                    value={task.description}
                    onChange={(e) => onUpdateInfo(sectionId, task.id, 'description', e.target.value)}
                    className="block w-full text-xs text-slate-400 bg-transparent border-none focus:ring-0 p-0 resize-none overflow-hidden mt-1 italic placeholder:text-slate-200 focus:outline-none"
                />
            </td>
            {manualRoles.map(role => (
                <td key={role.id} className="px-3 py-5 border-l border-slate-50">
                    <div className="flex items-center justify-center gap-1.5">
                        <input
                            type="number"
                            className="w-12 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-1.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                            value={task.estimates[role.id]?.min || ''}
                            onChange={(e) => onUpdateEstimate(sectionId, task.id, role.id, 'min', e.target.value)}
                        />
                        <span className="text-slate-300 font-light">—</span>
                        <input
                            type="number"
                            className="w-12 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-1.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                            value={task.estimates[role.id]?.max || ''}
                            onChange={(e) => onUpdateEstimate(sectionId, task.id, role.id, 'max', e.target.value)}
                        />
                    </div>
                </td>
            ))}

            {/* QA Hours */}
            <td className="px-3 py-5 border-l border-slate-100 bg-amber-50/30">
                <div className="flex flex-col items-center gap-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeQA}
                            onChange={() => onToggleQA(sectionId, task.id)}
                            className="w-3 h-3 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                        />
                    </label>
                    {includeQA && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                            <span className="opacity-60">{qaMin}</span>
                            <span className="text-amber-300">/</span>
                            <span>{qaMax}</span>
                        </div>
                    )}
                </div>
            </td>

            {/* PM Hours */}
            <td className="px-3 py-5 border-l border-slate-100 bg-teal-50/30">
                <div className="flex flex-col items-center gap-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includePM}
                            onChange={() => onTogglePM(sectionId, task.id)}
                            className="w-3 h-3 rounded border-teal-300 text-teal-500 focus:ring-teal-500"
                        />
                    </label>
                    {includePM && (
                        <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
                            <span className="opacity-60">{pmMin}</span>
                            <span className="text-teal-300">/</span>
                            <span>{pmMax}</span>
                        </div>
                    )}
                </div>
            </td>

            {/* Row Total (now includes QA+PM) */}
            <td className="px-6 py-5 border-l border-slate-100 bg-indigo-50/10">
                <div className="flex items-center justify-center gap-3 font-black text-indigo-600 text-xs">
                    <span className="opacity-60">{totalMin}</span>
                    <span className="text-indigo-200">/</span>
                    <span>{totalMax}</span>
                </div>
            </td>
            <td className="px-4 py-5 text-right">
                <button
                    onClick={() => onDelete(sectionId, task.id)}
                    className="text-slate-200 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
};

export default TaskRow;
