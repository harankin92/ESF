import React from 'react';
import { Phone, Mail, Calendar, MessageCircle, Globe, Linkedin, Facebook, Instagram, Youtube, Briefcase } from 'lucide-react';

const ReportContent = ({
    projectName,
    clientName,
    totals,
    sections,
    manualRoles,
    qaPercent,
    pmPercent,
    qaRate,
    pmRate,
    techStack,
    questions,
    discount
}) => {
    // Ensure we have a valid stack object even if prop is missing/old
    const stack = {
        development: [],
        infrastructure: [],
        other: [],
        ...(techStack || {})
    };

    const sectionCardClass = "bg-white rounded-2xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 print:shadow-none print:border-none print:p-0 print:mb-8 animate-slide-up print:animate-none";

    // CSS class for forcing a page break in PDF
    const printBreakClass = "print:pdf-page-break";

    const renderTechSection = (title, items, delayClass) => {
        const validItems = items?.filter(i => i.tool && i.tool.trim() !== '') || [];
        if (validItems.length === 0) return null;

        return (
            <div className={`avoid-break animate-slide-up ${delayClass} print:animate-none print:delay-0`}>
                <h3 className="font-exhibit font-black text-xs uppercase tracking-widest text-amber-600 mb-3 border-b-2 border-amber-200 pb-2 break-after-avoid">
                    {title}
                </h3>
                <div className="grid grid-cols-1 gap-1">
                    {validItems.map((item, idx) => (
                        <div key={idx} className="flex items-baseline text-xs py-1 px-2 rounded-lg hover:bg-amber-50 transition-all duration-200 hover:translate-x-1 avoid-break">
                            <div className="w-1/3 font-bold text-slate-800 pr-4">{item.tool}</div>
                            <div className="flex-1 text-slate-500 leading-relaxed border-l-2 border-slate-100 pl-4 py-0.5">
                                {item.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderQuestions = () => {
        const validQuestions = questions?.filter(q => q.question && q.question.trim() !== '') || [];
        if (validQuestions.length === 0) return null;

        return (
            <div className="avoid-break animate-slide-up delay-500 print:animate-none print:delay-0">
                <h3 className="font-exhibit font-black text-xs uppercase tracking-widest text-amber-600 mb-3 border-b-2 border-amber-200 pb-2 break-after-avoid">
                    Questions & Clarifications
                </h3>
                <div className="grid grid-cols-1 gap-1">
                    {validQuestions.map((q, idx) => (
                        <div key={idx} className="flex items-start text-xs py-1 px-2 rounded-lg hover:bg-amber-50 transition-all duration-200 hover:translate-x-1 avoid-break">
                            <span className="font-bold text-slate-400 mr-3 mt-0.5 select-none">{idx + 1}.</span>
                            <div className="flex-1 text-slate-700 font-medium leading-relaxed">
                                {q.question}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto h-full print:h-auto space-y-12 pb-20 print:space-y-0 print:pb-0">
            {/* Page 1: Header & Overview */}
            <div className={sectionCardClass}>
                {/* Document Header */}
                {/* Document Header */}
                <div className="flex justify-between items-end mb-8 pb-6 border-b-4 border-amber-400 avoid-break">
                    <div className="flex gap-6 items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <svg width="33" height="45" viewBox="0 0 33 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.82761 17.165C2.83697 17.165 3.65522 16.3445 3.65522 15.3325C3.65522 14.3204 2.83697 13.5 1.82761 13.5C0.818247 13.5 0 14.3204 0 15.3325C0 16.3445 0.818247 17.165 1.82761 17.165Z" fill="#FFC612" />
                                <path d="M14.0364 32.6721L4.50588 39.3299C4.09624 39.6171 3.53192 39.3213 3.53192 38.8186V21.1113C3.53192 20.1664 2.76993 19.4023 1.82748 19.4023C0.885029 19.4023 0.123047 20.1664 0.123047 21.1113V31.4916V43.2878C0.123047 44.6694 1.6728 45.4793 2.80145 44.6895L32.2696 24.1013C33.2407 23.4235 33.2435 21.9845 32.2753 21.3009L32.2724 21.298C31.6852 20.8844 30.9032 20.8815 30.3159 21.2923L14.0364 32.6721Z" fill="#FFC612" />
                                <path d="M22.4325 19.98L10.0918 28.6025C9.68221 28.8897 9.11788 28.5938 9.11788 28.0912V23.6996C9.11788 23.2141 9.51033 22.8206 9.99445 22.8206H10.6189C11.4726 22.8206 12.1629 22.1284 12.1629 21.2725V21.1117C12.1629 20.1667 11.3981 19.3998 10.4557 19.3998H7.20433C6.37646 19.3998 5.70328 20.0748 5.70328 20.9049V34.6887C5.70328 35.1741 6.24756 35.4585 6.64287 35.1799L11.0171 32.1238L27.6346 20.5114C28.494 19.9111 28.4969 18.6329 27.6404 18.0269L17.6028 10.944L2.48634 0.276489C1.49232 -0.424336 0.123047 0.287978 0.123047 1.5058V2.00845C0.123047 2.4996 0.360809 2.95628 0.758988 3.23776L22.4354 18.5324C22.9338 18.8914 22.931 19.6325 22.4325 19.98Z" fill="#FFC612" />
                            </svg>
                        </div>
                        {/* Project Details */}
                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Project Estimation</div>
                            <h1 className="text-2xl font-black text-slate-800">{projectName}</h1>
                            {clientName && <h2 className="text-lg font-bold text-slate-500 mt-1">{clientName}</h2>}
                            <p className="text-sm text-slate-400 mt-1">
                                {new Date().toLocaleDateString('ru-RU')} • {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black text-slate-400 uppercase mb-1">Budget Range</div>
                        <div className="text-2xl font-black text-amber-600 mb-2">
                            ${totals.totalCostOpt.toLocaleString()} - ${totals.totalCostPess.toLocaleString()}
                        </div>
                        {((totals.discountedCost > 0) || (discount > 0)) && (
                            <div className="inline-block bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 print-bg-amber-50">
                                <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-0.5 text-right">
                                    Discounted Budget (-{discount}%)
                                </div>
                                <div className="text-xl font-black text-green-700">
                                    ~${Math.round(totals.discountedCost || ((totals.totalCostOpt + totals.totalCostPess) / 2 * (1 - discount / 100))).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Team & Rates */}
                <div className="mb-8 animate-slide-up delay-75 avoid-break print:animate-none print:delay-0">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Team Rates</div>
                    <div className="flex flex-wrap gap-2">
                        {manualRoles.map(role => (
                            <span key={role.id} className={`px-3 py-1 rounded-full text-xs font-bold ${role.color} hover:shadow-md transition-shadow cursor-default`}>
                                {role.label} — ${role.rate}/h
                            </span>
                        ))}
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 hover:shadow-md transition-shadow cursor-default">
                            QA — ${qaRate}/h
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 hover:shadow-md transition-shadow cursor-default">
                            PM — ${pmRate}/h
                        </span>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4 avoid-break">
                    <div className="bg-slate-50 rounded-xl p-4 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 animate-slide-up delay-100 cursor-default print-bg-slate-50 print:animate-none">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dev Hours</div>
                        <div className="text-lg font-black text-slate-700">{totals.devOpt} - {totals.devPess}h</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 animate-slide-up delay-150 cursor-default print:animate-none">
                        <div className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-1">QA</div>
                        <div className="text-lg font-black text-blue-700">{totals.qaOpt} - {totals.qaPess}h</div>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-4 text-center hover:scale-105 hover:shadow-lg transition-all duration-300 animate-slide-up delay-200 cursor-default print:animate-none">
                        <div className="text-[9px] font-bold text-teal-500 uppercase tracking-wider mb-1">PM</div>
                        <div className="text-lg font-black text-teal-700">{totals.pmOpt} - {totals.pmPess}h</div>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 text-center border border-amber-400/30 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 animate-slide-up delay-300 cursor-default print:animate-none">
                        <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-1">Total Hours</div>
                        <div className="text-lg font-black text-white">{totals.totalOptHours} - {totals.totalPessHours}h</div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-amber-50 rounded-xl p-4 text-center mb-0 border border-amber-200 avoid-break animate-slide-up delay-300 hover:shadow-md transition-shadow duration-300 cursor-default print-bg-amber-50 print:animate-none">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Estimated Timeline</div>
                    <div className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
                        <span>~{Math.ceil(totals.maxWeeks)} weeks</span>
                        <span className="text-amber-400">•</span>
                        <span className="text-slate-600">~{(Math.ceil(totals.maxWeeks) / 4.3).toFixed(1)} months</span>
                    </div>
                </div>
            </div>

            {/* Detailed Estimation Sections - Wrapped in a single card */}
            {sections.length > 0 && (
                <div className={`${sectionCardClass} delay-400 print:delay-0`}>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Detailed Breakdown</div>
                    <div className="space-y-8 print:space-y-4">
                        {sections.map((section) => (
                            <div key={section.id} className="print:mb-4">
                                <div className="bg-slate-800 text-white px-4 py-2 border-b-2 border-amber-400 rounded-t-xl overflow-hidden break-after-avoid">
                                    <h3 className="font-black text-sm uppercase tracking-wide text-amber-400">{section.title}</h3>
                                </div>
                                <table className="w-full text-xs table-fixed">
                                    <thead className="table-header-group">
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="w-[250px] px-4 py-2 text-left font-bold text-slate-500 uppercase text-[10px]">Task</th>
                                            {manualRoles.map(role => (
                                                <th key={role.id} className="w-[85px] px-2 py-2 text-center font-bold text-[10px]">
                                                    <span className={`px-2 py-0.5 rounded-full ${role.color} block w-full truncate`}>{role.label}</span>
                                                </th>
                                            ))}
                                            <th className="w-[70px] px-2 py-2 text-center bg-blue-50 font-bold text-blue-600 text-[10px]">QA</th>
                                            <th className="w-[70px] px-2 py-2 text-center bg-teal-50 font-bold text-teal-600 text-[10px]">PM</th>
                                            <th className="w-[90px] px-2 py-2 text-center bg-amber-50 font-black text-amber-700 text-[10px]">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {section.tasks.map(task => {
                                            const devMin = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.min || 0), 0);
                                            const devMax = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.max || 0), 0);
                                            const includeQA = task.includeQA !== false;
                                            const includePM = task.includePM !== false;
                                            const qaMin = includeQA ? Math.round(devMin * qaPercent / 100) : 0;
                                            const qaMax = includeQA ? Math.round(devMax * qaPercent / 100) : 0;
                                            const pmMin = includePM ? Math.round((devMin + qaMin) * pmPercent / 100) : 0;
                                            const pmMax = includePM ? Math.round((devMax + qaMax) * pmPercent / 100) : 0;
                                            const totalMin = devMin + qaMin + pmMin;
                                            const totalMax = devMax + qaMax + pmMax;

                                            return (
                                                <tr key={task.id} className="hover:bg-amber-50 transition-colors duration-200 avoid-break group">
                                                    <td className="px-4 py-3 group-hover:pl-5 transition-all duration-200">
                                                        <div className="font-bold text-slate-800">{task.name || 'Untitled'}</div>
                                                        {task.description && (
                                                            <div className="text-[10px] text-slate-400 italic font-normal">{task.description}</div>
                                                        )}
                                                    </td>
                                                    {manualRoles.map(role => {
                                                        const est = task.estimates[role.id];
                                                        return (
                                                            <td key={role.id} className="px-3 py-3 text-center font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                                                                {est?.max > 0 ? `${est.min}-${est.max}` : '—'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-3 py-3 text-center bg-blue-50/50 group-hover:bg-blue-100/50 font-medium text-blue-700 transition-colors">
                                                        {includeQA ? `${qaMin}-${qaMax}` : '—'}
                                                    </td>
                                                    <td className="px-3 py-3 text-center bg-teal-50/50 group-hover:bg-teal-100/50 font-medium text-teal-700 transition-colors">
                                                        {includePM ? `${pmMin}-${pmMax}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center bg-amber-50/50 group-hover:bg-amber-100/50 font-black text-amber-700 transition-colors">
                                                        {totalMin}-{totalMax}h
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Page 3: Tech Stack & Questions */}
            {(stack.development?.some(i => i.tool) || stack.infrastructure?.some(i => i.tool) || stack.other?.some(i => i.tool) || (questions?.some(q => q.question))) && (
                <div className={`${sectionCardClass} delay-700 print:delay-0`}>
                    <div className="space-y-4">
                        {(stack.development?.some(i => i.tool) || stack.infrastructure?.some(i => i.tool) || stack.other?.some(i => i.tool)) && (
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2 border-b border-slate-100 pb-4 break-after-avoid">Technical Stack</div>
                        )}
                        {renderTechSection('Developer Frameworks & Tools', stack.development, 'delay-500')}
                        {renderTechSection('Infrastructure & Hosting', stack.infrastructure, 'delay-500')}
                        {renderTechSection('Other Tools', stack.other, 'delay-500')}
                        {renderQuestions()}
                    </div>
                </div>
            )}

            {/* Page 4: Footer */}
            <div className={`${sectionCardClass} relative z-10 print:mt-8 print:pt-8`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-x-12 gap-y-12 print:gap-y-8">
                    {/* Contacts */}
                    <div className="min-w-[200px]">
                        <h3 className="font-exhibit font-black text-xs uppercase tracking-widest text-amber-600 mb-6 border-b-2 border-amber-200 pb-2">Contacts</h3>
                        <div className="space-y-2 print:space-y-1">
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium relative z-20">
                                <Phone size={14} className="text-amber-500" />
                                <a href="tel:+380636599155" className="hover:text-amber-600 pointer-events-auto print:text-amber-600">+38 (063) 659 91 55</a>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium relative z-20">
                                <Mail size={14} className="text-amber-500" />
                                <a href="mailto:hi@devit.group" className="hover:text-amber-600 pointer-events-auto print:text-amber-600">hi@devit.group</a>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium relative z-20">
                                <Calendar size={14} className="text-amber-500" />
                                <a href="https://calendly.com/devit_group/30min?hide_gdpr_banner=1&embed_type=Inline&embed_domain=1" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 pointer-events-auto print:text-amber-600">Book a call</a>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium relative z-20">
                                <MessageCircle size={14} className="text-amber-500" />
                                <a href="https://webforms.pipedrive.com/f/72q7jdalFzBMzqXYwotFTcrXdoecKm7fUWX0iPZjkFQ0StkZkiRQ3geFE1mViGYBBF?embeded=1" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 pointer-events-auto print:text-amber-600">Live chat</a>
                            </div>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="flex-1">
                        <h3 className="font-exhibit font-black text-xs uppercase tracking-widest text-amber-600 mb-6 border-b-2 border-amber-200 pb-2">Follow Us</h3>
                        <div className="grid grid-cols-5 gap-y-2 gap-x-6">
                            <a href="https://clutch.co/profile/devit" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-amber-600 transition-colors pointer-events-auto relative z-20">
                                <Globe size={12} /> Clutch
                            </a>
                            <a href="https://www.goodfirms.co/company/devit" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-amber-600 transition-colors pointer-events-auto relative z-20">
                                <Globe size={12} /> GoodFirms
                            </a>
                            <a href="https://www.designrush.com/agency/profile/devit" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-amber-600 transition-colors pointer-events-auto relative z-20">
                                <Globe size={12} /> DesignRush
                            </a>
                            <a href="https://www.linkedin.com/company/devit-group/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-blue-600 transition-colors pointer-events-auto relative z-20">
                                <Linkedin size={12} /> LinkedIn
                            </a>
                            <a href="https://www.upwork.com/agencies/devit/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-green-600 transition-colors pointer-events-auto relative z-20">
                                <Briefcase size={12} /> Upwork
                            </a>
                            <a href="https://www.behance.net/DevIT-group" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-blue-500 transition-colors pointer-events-auto relative z-20">
                                <Globe size={12} /> Behance
                            </a>
                            <a href="https://jobs.dou.ua/companies/devit/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-red-500 transition-colors pointer-events-auto relative z-20">
                                <Globe size={12} /> DOU
                            </a>
                            <a href="https://www.facebook.com/devit.group" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-blue-700 transition-colors pointer-events-auto relative z-20">
                                <Facebook size={12} /> Facebook
                            </a>
                            <a href="https://www.instagram.com/devit.group/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-pink-600 transition-colors pointer-events-auto relative z-20">
                                <Instagram size={12} /> Instagram
                            </a>
                            <a href="https://www.youtube.com/@DevIT-group" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-red-600 transition-colors pointer-events-auto relative z-20">
                                <Youtube size={12} /> YouTube
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportContent;
