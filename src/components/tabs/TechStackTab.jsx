import { Plus, Trash2 } from 'lucide-react';

const TechSection = ({ title, items = [], category, onChange }) => {
    const updateItem = (idx, field, value) => {
        const copy = [...items];
        copy[idx] = { ...copy[idx], [field]: value };
        onChange(category, copy);
    };

    const deleteItem = (idx) => {
        onChange(category, items.filter((_, i) => i !== idx));
    };

    const addItem = () => {
        onChange(category, [...items, { tool: '', description: '' }]);
    };

    return (
        <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-200">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">{title}</h3>
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center group">
                        <input
                            className="w-1/3 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            placeholder="Service / Tool"
                            value={item.tool || ''}
                            onChange={e => updateItem(idx, 'tool', e.target.value)}
                        />
                        <input
                            className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            placeholder="Description"
                            value={item.description || ''}
                            onChange={e => updateItem(idx, 'description', e.target.value)}
                        />
                        <button
                            onClick={() => deleteItem(idx)}
                            className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addItem}
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-2 rounded-lg transition-all"
                >
                    <Plus size={14} /> ADD ITEM
                </button>
            </div>
        </div>
    );
};

const TechStackTab = ({ techStack, setTechStack }) => {
    // Ensure techStack has all required keys if initialized with empty or partial object
    const stack = {
        development: [],
        infrastructure: [],
        other: [],
        ...techStack
    };

    const handleCategoryChange = (category, newItems) => {
        setTechStack({
            ...stack,
            [category]: newItems
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 animate-in fade-in duration-300 transition-colors duration-200">
            <h2 className="text-2xl font-black mb-2 text-slate-800 dark:text-slate-100">Technical Data & Stack</h2>
            <p className="text-slate-400 dark:text-slate-500 mb-8 max-w-2xl">Define the technologies, services, and infrastructure components required for this project.</p>

            <div className="space-y-8">
                <TechSection
                    title="Developer Frameworks & Tools"
                    category="development"
                    items={stack.development}
                    onChange={handleCategoryChange}
                />

                <TechSection
                    title="Infrastructure & Hosting"
                    category="infrastructure"
                    items={stack.infrastructure}
                    onChange={handleCategoryChange}
                />

                <TechSection
                    title="Other Tools (Libraries, APIs, etc.)"
                    category="other"
                    items={stack.other}
                    onChange={handleCategoryChange}
                />
            </div>
        </div>
    );
};

export default TechStackTab;
