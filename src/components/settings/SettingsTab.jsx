import { Plus, UserPlus, Calculator } from 'lucide-react';
import RoleCard from './RoleCard';

const SettingsTab = ({
    manualRoles,
    onAddRole,
    onUpdateRole,
    onDeleteRole,
    qaPercent, setQaPercent,
    pmPercent, setPmPercent,
    qaRate, setQaRate,
    pmRate, setPmRate,
    discount, setDiscount
}) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Executors Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800 tracking-tight">
                            <UserPlus className="text-indigo-600" size={28} />
                            Project Executors
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 font-medium">Define manual roles and their billing rates.</p>
                    </div>
                    <button
                        onClick={onAddRole}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    >
                        <Plus size={18} /> Add Role
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {manualRoles.map(role => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onUpdate={onUpdateRole}
                            onDelete={onDeleteRole}
                        />
                    ))}
                </div>
            </div>

            {/* QA & PM Formulas Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800 tracking-tight mb-8">
                    <Calculator className="text-orange-600" size={28} />
                    Automatic Formulas (QA & PM)
                </h2>
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Discount</h3>
                            <p className="text-sm text-slate-400">Optional discount applied to the average budget.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-20 font-black text-right text-lg text-indigo-600 focus:outline-none"
                            />
                            <span className="font-bold text-slate-400">%</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* QA Settings */}
                    <div className="p-8 border border-orange-100 rounded-2xl bg-orange-50/30">
                        <h3 className="font-black text-orange-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                            <span className="bg-orange-200 w-2 h-2 rounded-full"></span>
                            Quality Assurance
                        </h3>
                        <div className="space-y-6 text-sm">
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                <span className="text-slate-600 font-bold">QA Load (% of Dev)</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={qaPercent}
                                        onChange={(e) => setQaPercent(parseInt(e.target.value) || 0)}
                                        className="w-16 p-1 border-none font-black text-right text-orange-600 focus:ring-0"
                                    />
                                    <span className="font-bold text-orange-300">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                <span className="text-slate-600 font-bold">QA Hourly Rate ($)</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={qaRate}
                                        onChange={(e) => setQaRate(parseInt(e.target.value) || 0)}
                                        className="w-16 p-1 border-none font-black text-right text-orange-600 focus:ring-0"
                                    />
                                    <span className="font-bold text-orange-300">$</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PM Settings */}
                    <div className="p-8 border border-indigo-100 rounded-2xl bg-indigo-50/30">
                        <h3 className="font-black text-indigo-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                            <span className="bg-indigo-200 w-2 h-2 rounded-full"></span>
                            Project Management
                        </h3>
                        <div className="space-y-6 text-sm">
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                                <span className="text-slate-600 font-bold">PM Load (% of Dev+QA)</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={pmPercent}
                                        onChange={(e) => setPmPercent(parseInt(e.target.value) || 0)}
                                        className="w-16 p-1 border-none font-black text-right text-indigo-600 focus:ring-0"
                                    />
                                    <span className="font-bold text-indigo-300">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                                <span className="text-slate-600 font-bold">PM Hourly Rate ($)</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={pmRate}
                                        onChange={(e) => setPmRate(parseInt(e.target.value) || 0)}
                                        className="w-16 p-1 border-none font-black text-right text-indigo-600 focus:ring-0"
                                    />
                                    <span className="font-bold text-indigo-300">$</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
