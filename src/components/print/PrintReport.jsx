import { Calculator } from 'lucide-react';

const PrintReport = ({ projectName, totals, sections, manualRoles, qaPercent, pmPercent }) => {
    return (
        <div className="hidden print:block print:p-0 print-report">
            <div className="flex justify-between items-end mb-12 border-b-4 border-indigo-600 pb-6">
                <div>
                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Project Estimation Artifact</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{projectName}</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Generated on {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-black text-slate-400 uppercase mb-1">Final Budget Range</div>
                    <div className="text-3xl font-black text-indigo-600 tracking-tighter">
                        ${totals.totalCostOpt.toLocaleString()} - ${totals.totalCostPess.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-slate-50 rounded-2xl border">
                    <h4 className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">Engineering Effort</h4>
                    <div className="text-2xl font-black text-slate-800">{totals.devOpt}h - {totals.devPess}h</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1">Core development & setup</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border">
                    <h4 className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">Management & QA</h4>
                    <div className="text-2xl font-black text-slate-800">{totals.qaPess + totals.pmPess}h</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1">Quality & delivery oversight</div>
                </div>
                <div className="p-6 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
                    <h4 className="text-[9px] font-black uppercase text-indigo-200 mb-2 tracking-widest">Delivery Timeline</h4>
                    <div className="text-2xl font-black text-white">~{Math.round(totals.maxWeeks)} Weeks</div>
                    <div className="text-[10px] text-indigo-200 font-bold mt-1">Estimated go-live date</div>
                </div>
            </div>

            {sections.map(sec => (
                <div key={sec.id} className="mb-10 avoid-break">
                    <h2 className="text-xs font-black bg-slate-900 text-white px-4 py-2 mb-4 uppercase tracking-widest rounded-lg">{sec.title}</h2>
                    <table className="w-full text-[10px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="p-3 border border-slate-300 text-left uppercase font-black text-slate-400 w-1/3">Feature</th>
                                {manualRoles.map(r => (
                                    <th key={r.id} className="p-3 border border-slate-300 text-center uppercase font-black text-slate-400">{r.label}</th>
                                ))}
                                <th className="p-3 border border-slate-300 text-center bg-slate-100 uppercase font-black text-slate-700">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sec.tasks.map(task => {
                                const rowMin = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.min || 0), 0);
                                const rowMax = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.max || 0), 0);
                                return (
                                    <tr key={task.id}>
                                        <td className="p-3 border border-slate-200">
                                            <div className="font-black text-slate-800 text-xs">{task.name}</div>
                                            <div className="text-slate-500 italic text-[9px]">{task.description}</div>
                                        </td>
                                        {manualRoles.map(r => (
                                            <td key={r.id} className="p-3 border border-slate-200 text-center font-bold">
                                                {task.estimates[r.id]?.max > 0 ? `${task.estimates[r.id]?.min}-${task.estimates[r.id]?.max}` : '—'}
                                            </td>
                                        ))}
                                        <td className="p-3 border border-slate-200 text-center font-black bg-slate-50 text-slate-900 text-xs">
                                            {rowMin}-{rowMax}h
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ))}

            <div className="mt-12 p-8 border-2 border-slate-100 rounded-3xl bg-slate-50/50 avoid-break relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Calculator size={80} />
                </div>
                <h3 className="font-black text-sm mb-6 uppercase tracking-widest text-slate-400">Calculation Methodology</h3>
                <div className="grid grid-cols-2 gap-12 text-[10px]">
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-slate-200 pb-1 italic">
                            <span>Raw Development (Pessimistic):</span>
                            <span className="font-bold">{totals.devPess}h</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1 italic">
                            <span>Quality Assurance ({qaPercent}% of dev):</span>
                            <span className="font-bold">{totals.qaPess}h</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1 italic">
                            <span>Project Management ({pmPercent}% of dev+qa):</span>
                            <span className="font-bold">{totals.pmPess}h</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black text-slate-800">
                            <span>Grand Total Effort:</span>
                            <span>{totals.totalPessHours}h</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-indigo-600 pt-2">
                            <span>Total Estimated Project Cost:</span>
                            <span>${totals.totalCostPess.toLocaleString()}</span>
                        </div>
                        <p className="text-[8px] text-slate-400 mt-4 leading-relaxed">
                            Note: This is a preliminary estimation. Actual timelines and costs may vary based on final scope, 3rd party integrations, and requirement shifts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintReport;
