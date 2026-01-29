import { Trash2 } from 'lucide-react';

const RoleCard = ({ role, onUpdate, onDelete }) => {
    return (
        <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 relative group border-b-4 border-b-slate-200 hover:border-b-indigo-400 transition-all">
            <button
                onClick={() => onDelete(role.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
            >
                <Trash2 size={16} />
            </button>
            <div className="space-y-5">
                <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Role Name</label>
                    <input
                        value={role.label}
                        onChange={(e) => onUpdate(role.id, 'label', e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Rate ($/h)</label>
                        <input
                            type="number"
                            value={role.rate}
                            onChange={(e) => onUpdate(role.id, 'rate', parseInt(e.target.value) || 0)}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Hours/Day</label>
                        <input
                            type="number"
                            value={role.hoursPerDay}
                            onChange={(e) => onUpdate(role.id, 'hoursPerDay', parseInt(e.target.value) || 0)}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleCard;
