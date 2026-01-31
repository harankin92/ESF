const statusConfig = {
    'New': {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        dot: 'bg-blue-500'
    },
    'Pending Review': {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-700 dark:text-indigo-400',
        dot: 'bg-indigo-500'
    },
    'Reviewing': {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        dot: 'bg-yellow-500'
    },
    'Pending Estimation': {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        dot: 'bg-orange-500'
    },
    'Estimated': {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        dot: 'bg-green-500'
    },
    'Rejected': {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-500'
    },
    'Contract': {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500'
    },
    // Project statuses
    'Active': {
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        text: 'text-cyan-700 dark:text-cyan-400',
        dot: 'bg-cyan-500'
    },
    'Paused': {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500'
    },
    'Finished': {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        dot: 'bg-purple-500'
    }
};


const StatusBadge = ({ status, size = 'sm' }) => {
    const config = statusConfig[status] || statusConfig['New'];

    const sizeClasses = {
        xs: 'text-[9px] px-2 py-0.5',
        sm: 'text-[10px] px-2.5 py-1',
        md: 'text-xs px-3 py-1.5'
    };

    return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full uppercase tracking-wide ${config.bg} ${config.text} ${sizeClasses[size]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {status}
        </span>
    );
};

export default StatusBadge;
