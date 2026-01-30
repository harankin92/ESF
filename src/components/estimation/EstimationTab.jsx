import { Plus } from 'lucide-react';
import SectionBlock from './SectionBlock';

const EstimationTab = ({
    sections,
    manualRoles,
    qaPercent,
    pmPercent,
    onAddTask,
    onAddSection,
    onUpdateEstimate,
    onUpdateTaskInfo,
    onDeleteTask,
    onUpdateSectionTitle,
    onToggleQA,
    onTogglePM
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {sections.map((section) => (
                <SectionBlock
                    key={section.id}
                    section={section}
                    manualRoles={manualRoles}
                    qaPercent={qaPercent}
                    pmPercent={pmPercent}
                    onAddTask={onAddTask}
                    onUpdateEstimate={onUpdateEstimate}
                    onUpdateInfo={onUpdateTaskInfo}
                    onDeleteTask={onDeleteTask}
                    onUpdateTitle={onUpdateSectionTitle}
                    onToggleQA={onToggleQA}
                    onTogglePM={onTogglePM}
                />
            ))}

            <button
                onClick={onAddSection}
                className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-3 group"
            >
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                    <Plus size={20} />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest">Create New Section</span>
            </button>
        </div>
    );
};

export default EstimationTab;
