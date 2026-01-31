const statusConfig = {
    'New': {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        dot: 'bg-blue-500'
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
