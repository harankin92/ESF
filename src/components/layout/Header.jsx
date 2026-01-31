import { Layers, Settings, Download, Clock, Database, MessageSquare, Save, ArrowLeft, Check, FileText, CheckCircle } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({
    projectName,
    setProjectName,
    clientName,
    setClientName,
    activeTab,
    setActiveTab,
    onPrintReport,
    onSave,
    onApprove,
    onBack,
    saving,
    saveMessage,
    showSave = true,
    user
}) => {
    const tabs = [
        { id: 'estimation', label: 'Estimation', icon: <Clock size={16} /> },
        { id: 'tech-stack', label: 'Tech Stack', icon: <Database size={16} /> },
        { id: 'questions', label: 'Questions', icon: <MessageSquare size={16} /> },
        { id: 'overview', label: 'Lead Overview', icon: <FileText size={16} /> }
    ];

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 no-print backdrop-blur-md bg-white/80 dark:bg-slate-900/80 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="bg-amber-500 p-2 rounded-xl text-slate-900 shadow-lg shadow-amber-200 dark:shadow-none">
                        <Layers size={20} />
                    </div>
                    <div className="flex flex-col justify-center">
                        <input
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0 leading-tight focus:outline-none placeholder-slate-300 dark:placeholder-slate-600 text-slate-800 dark:text-slate-100 w-full"
                            readOnly={!showSave}
                            placeholder="Project Name"
                        />
                        {/* Client Name Input */}
                        <input
                            value={clientName}
                            onChange={(e) => setClientName && setClientName(e.target.value)}
                            className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-400 dark:text-slate-500 placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none uppercase tracking-wide w-full"
                            readOnly={!showSave}
                            placeholder="+ ADD CLIENT NAME"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 shadow-inner'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Settings size={18} />
                        <span className="hidden sm:inline">Settings</span>
                    </button>

                    {showSave && onSave && (
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-xl shadow-lg shadow-green-100 dark:shadow-none transition-all"
                        >
                            {saveMessage ? (
                                <>
                                    <Check size={18} />
                                    <span className="font-semibold">{saveMessage}</span>
                                </>
                            ) : saving ? (
                                <span className="font-semibold animate-pulse">Saving...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span className="font-semibold">Save</span>
                                </>
                            )}
                        </button>
                    )}

                    {onApprove && (
                        <button
                            onClick={onApprove}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none transition-all"
                        >
                            <CheckCircle size={18} />
                            <span className="font-semibold">Approve</span>
                        </button>
                    )}

                    <button
                        onClick={onPrintReport}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-5 py-2 rounded-xl shadow-lg shadow-amber-100 dark:shadow-none transition-all active:scale-95"
                    >
                        <Download size={18} />
                        <span className="font-semibold">Export PDF</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 flex gap-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-1 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === tab.id
                            ? 'border-amber-500 text-amber-600 dark:text-amber-500'
                            : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
        </header>
    );
};

export default Header;
