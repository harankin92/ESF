import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    ArrowLeft,
    Save,
    Briefcase,
    Code2,
    DollarSign,
    Calendar,
    Users,
    Globe,
    Clock,
    Link,
    FileText,
    MessageSquare
} from 'lucide-react';

const cooperationModels = [
    'Fixed Price',
    'Time & Material',
    'Dedicated Team',
    'Staff Augmentation',
    'Hybrid'
];

const englishLevels = [
    'Beginner',
    'Elementary',
    'Intermediate',
    'Upper-Intermediate',
    'Advanced',
    'Native'
];

const projectStages = [
    'Idea',
    'MVP',
    'Active Development',
    'Scaling',
    'Maintenance'
];

const InputField = ({ label, name, value, onChange, icon: Icon, type = 'text', placeholder, required }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            )}
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
            />
        </div>
    </div>
);

const SelectField = ({ label, name, value, onChange, icon: Icon, options, placeholder }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            )}
            <select
                name={name}
                value={value || ''}
                onChange={onChange}
                className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
            >
                <option value="">{placeholder || 'Select...'}</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    </div>
);

const TextAreaField = ({ label, name, value, onChange, icon: Icon, placeholder, rows = 3 }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <Icon size={16} className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            )}
            <textarea
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all resize-none ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
            />
        </div>
    </div>
);

const RequestForm = ({ leadId, onBack, onSuccess, initialData = null }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        project_name: '',
        cooperation_model: '',
        work_type: '',
        tech_stack: '',
        hourly_rate: '',
        budget: '',
        timeframe: '',
        deadline: '',
        start_date: '',
        team_need: '',
        english_level: '',
        meetings: '',
        project_stage: '',
        intro_call_link: '',
        call_summary: '',
        presentation_link: '',
        business_idea: '',
        job_description: '',
        design_link: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (initialData && initialData.id) {
                await api.updateRequest(initialData.id, formData);
            } else {
                await api.createRequest({ ...formData, lead_id: leadId });
            }
            onSuccess?.();
            onBack();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                {initialData ? 'Edit Request' : 'New Request'}
                            </h1>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {initialData ? 'Update project details' : 'Fill in project details'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Project Name */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Project Name
                        </h2>
                        <InputField
                            label="Project Name"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            icon={Briefcase}
                            placeholder="e.g., E-commerce Platform, Mobile Banking App"
                            required
                        />
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Project Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Cooperation Model"
                                name="cooperation_model"
                                value={formData.cooperation_model}
                                onChange={handleChange}
                                icon={Briefcase}
                                options={cooperationModels}
                                placeholder="Select model"
                            />
                            <InputField
                                label="Work Type"
                                name="work_type"
                                value={formData.work_type}
                                onChange={handleChange}
                                icon={Briefcase}
                                placeholder="e.g., Web App, Mobile App"
                            />
                            <InputField
                                label="Tech Stack Needed"
                                name="tech_stack"
                                value={formData.tech_stack}
                                onChange={handleChange}
                                icon={Code2}
                                placeholder="e.g., React, Node.js, Python"
                            />
                            <SelectField
                                label="Project Stage"
                                name="project_stage"
                                value={formData.project_stage}
                                onChange={handleChange}
                                icon={Briefcase}
                                options={projectStages}
                                placeholder="Select stage"
                            />
                        </div>
                    </div>

                    {/* Financial */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Financial Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Hourly Rate"
                                name="hourly_rate"
                                value={formData.hourly_rate}
                                onChange={handleChange}
                                icon={DollarSign}
                                type="number"
                                placeholder="e.g., 50"
                            />
                            <InputField
                                label="Budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                icon={DollarSign}
                                placeholder="e.g., $50,000 - $100,000"
                            />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Timeline
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField
                                label="Timeframe"
                                name="timeframe"
                                value={formData.timeframe}
                                onChange={handleChange}
                                icon={Clock}
                                placeholder="e.g., 3-6 months"
                            />
                            <InputField
                                label="Deadline"
                                name="deadline"
                                value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                                onChange={handleChange}
                                icon={Calendar}
                                type="date"
                            />
                            <InputField
                                label="Start Date"
                                name="start_date"
                                value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                                onChange={handleChange}
                                icon={Calendar}
                                type="date"
                            />
                        </div>
                    </div>

                    {/* Team & Communication */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Team & Communication
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Team Need"
                                name="team_need"
                                value={formData.team_need}
                                onChange={handleChange}
                                icon={Users}
                                placeholder="e.g., 3 devs, 1 designer"
                            />
                            <SelectField
                                label="English Level"
                                name="english_level"
                                value={formData.english_level}
                                onChange={handleChange}
                                icon={MessageSquare}
                                options={englishLevels}
                                placeholder="Select level"
                            />
                            <InputField
                                label="Meetings"
                                name="meetings"
                                value={formData.meetings}
                                onChange={handleChange}
                                icon={Clock}
                                placeholder="e.g., Daily standups"
                            />
                        </div>
                    </div>

                    {/* Links */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Links & Resources
                        </h2>
                        <div className="space-y-4">
                            <InputField
                                label="Intro Call Recording"
                                name="intro_call_link"
                                value={formData.intro_call_link}
                                onChange={handleChange}
                                icon={Link}
                                placeholder="https://..."
                            />
                            <TextAreaField
                                label="Call Summary (AI Transcription)"
                                name="call_summary"
                                value={formData.call_summary}
                                onChange={handleChange}
                                icon={FileText}
                                placeholder="Paste AI transcription summary here..."
                                rows={4}
                            />
                            <InputField
                                label="Presentation Links"
                                name="presentation_link"
                                value={formData.presentation_link}
                                onChange={handleChange}
                                icon={Link}
                                placeholder="https://..."
                            />
                            <InputField
                                label="Design / Reference Link"
                                name="design_link"
                                value={formData.design_link}
                                onChange={handleChange}
                                icon={Link}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Project Description
                        </h2>
                        <div className="space-y-4">
                            <TextAreaField
                                label="Business Idea (RU/UA)"
                                name="business_idea"
                                value={formData.business_idea}
                                onChange={handleChange}
                                icon={FileText}
                                placeholder="Опишите бизнес-идею клиента..."
                                rows={4}
                            />
                            <TextAreaField
                                label="Job Description"
                                name="job_description"
                                value={formData.job_description}
                                onChange={handleChange}
                                icon={FileText}
                                placeholder="Detailed job/project description..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 p-8">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${initialData
                                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-blue-100 dark:shadow-none'
                                : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 shadow-emerald-100 dark:shadow-none'
                                }`}
                        >
                            <Save size={18} />
                            {loading
                                ? (initialData ? 'Saving...' : 'Creating...')
                                : (initialData ? 'Update Request' : 'Create Request')
                            }
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default RequestForm;
