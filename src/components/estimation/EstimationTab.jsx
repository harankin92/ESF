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
                className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 group"
            >
                <div className="bg-slate-100 p-2 rounded-full group-hover:bg-indigo-100 transition-colors">
                    <Plus size={20} />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest">Create New Section</span>
            </button>
        </div>
    );
};

export default EstimationTab;
