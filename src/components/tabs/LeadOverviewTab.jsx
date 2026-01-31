import React from 'react';
import {
    Building2,
    Briefcase,
    Code2,
    DollarSign,
    Calendar,
    Users,
    Globe,
    Clock,
    Link as LinkIcon,
    MessageSquare,
    User,
    ExternalLink
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value, isLink }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-2">
            <Icon size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wide mb-0.5">
                    {label}
                </div>
                {isLink ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                    >
                        {value}
                        <ExternalLink size={12} />
                    </a>
                ) : (
                    <div className="text-sm text-slate-800 dark:text-slate-100">{value}</div>
                )}
            </div>
        </div>
    );
};

const LeadOverviewTab = ({ lead }) => {
    if (!lead) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                <p>No lead information available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Meta Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{lead.client_name}</h2>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500">
                        {lead.status}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>Created by {lead.creator_name}</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{new Date(lead.created_at).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Project Overview */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
                <h3 className="text-sm font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-3">
                    Project Overview (PreSale)
                </h3>
                <div className="text-sm text-indigo-900 dark:text-indigo-100 whitespace-pre-wrap">
                    {lead.project_overview || 'No overview provided.'}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                        Basic Information
                    </h3>
                    <div className="space-y-1">
                        <InfoRow icon={Briefcase} label="Cooperation Model" value={lead.cooperation_model} />
                        <InfoRow icon={Briefcase} label="Work Type" value={lead.work_type} />
                        <InfoRow icon={Code2} label="Tech Stack" value={lead.tech_stack} />
                    </div>
                </div>

                {/* Team */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                        Team & Communication
                    </h3>
                    <div className="space-y-1">
                        <InfoRow icon={Users} label="Team Need" value={lead.team_need} />
                        <InfoRow icon={MessageSquare} label="English Level" value={lead.english_level} />
                        <InfoRow icon={Globe} label="Timezone" value={lead.timezone} />
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
                    Links & Resources
                </h3>
                <div className="space-y-2">
                    <InfoRow icon={LinkIcon} label="Intro Call Recording" value={lead.intro_call_link} isLink />
                    <InfoRow icon={LinkIcon} label="Presentation Links" value={lead.presentation_link} isLink />
                    <InfoRow icon={LinkIcon} label="Design / Reference" value={lead.design_link} isLink />
                </div>
            </div>

            {/* Descriptions */}
            {(lead.business_idea || lead.job_description) && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                    {lead.business_idea && (
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-3">Business Idea</h3>
                            <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{lead.business_idea}</div>
                        </div>
                    )}
                    {lead.job_description && (
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-3">Job Description</h3>
                            <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{lead.job_description}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeadOverviewTab;
