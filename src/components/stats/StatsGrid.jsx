import { Clock, Info } from 'lucide-react';

const StatsGrid = ({ totals, qaPercent, pmPercent }) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 print:hidden">
                {/* Total Hours */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Clock size={64} className="text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
                        Total Hours
                    </div>
                    <div className="text-3xl font-black text-slate-800">{totals.totalOptHours}h - {totals.totalPessHours}h</div>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                        <Info size={10} /> Auto-calculated
                    </div>
                </div>

                {/* Budget */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
                        Estimate Budget
                    </div>
                    <div className="text-3xl font-black text-green-600">
                        ${totals.totalCostOpt.toLocaleString()} - ${totals.totalCostPess.toLocaleString()}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400">Based on role rates</div>
                </div>

                {/* Indirect Effort */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
                        Indirect Effort
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">QA ({qaPercent}%):</span>
                            <span className="text-blue-600">{totals.qaPess}h</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">PM ({pmPercent}%):</span>
                            <span className="text-teal-600">{totals.pmPess}h</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow mb-10 print:hidden flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 text-slate-400 mb-1 font-bold text-[10px] uppercase tracking-wider">
                        Timeline
                    </div>
                    <div className="flex items-baseline gap-3">
                        <div className="text-3xl font-black text-slate-800">~{Math.ceil(totals.maxWeeks)} weeks</div>
                        <div className="text-xl font-bold text-slate-400">~{(Math.ceil(totals.maxWeeks) / 4.3).toFixed(1)} months</div>
                    </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 max-w-[200px]">
                    Calculated based on the most loaded specialist's hours divided by weekly capacity.
                </div>
            </div>
        </>
    );
};

export default StatsGrid;
