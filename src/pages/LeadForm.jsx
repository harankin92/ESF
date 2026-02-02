import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    ArrowLeft,
    Save,
    Building2,
    Globe,
    MapPin
} from 'lucide-react';

const sources = ['Upwork', 'LinkedIn', 'Website', 'Referral', 'Other'];

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

const LeadForm = ({ onBack, onSuccess, initialData = null }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        client_name: '',
        company: '',
        timezone: '',
        source: ''
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
        if (!formData.client_name.trim()) {
            setError('Client name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (initialData && initialData.id) {
                await api.updateLead(initialData.id, formData);
            } else {
                await api.createLead(formData);
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
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                {initialData ? 'Edit Lead' : 'New Lead'}
                            </h1>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Client basic info
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Client Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-6">
                            Client Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Client Name"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleChange}
                                icon={Building2}
                                placeholder="Client or contact name"
                                required
                            />
                            <InputField
                                label="Company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                icon={Building2}
                                placeholder="Company name (if any)"
                            />
                            <InputField
                                label="Timezone"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                icon={Globe}
                                placeholder="e.g., EST, UTC+2"
                            />
                            <SelectField
                                label="Source"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                icon={MapPin}
                                options={sources}
                                placeholder="Where from?"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
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
                                : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-indigo-100 dark:shadow-none'
                                }`}
                        >
                            <Save size={18} />
                            {loading
                                ? (initialData ? 'Saving...' : 'Creating...')
                                : (initialData ? 'Update Lead' : 'Create Lead')
                            }
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default LeadForm;
