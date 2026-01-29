export const DEFAULT_MANUAL_ROLES = [
    { id: 'frontend', label: 'Front-End', rate: 40, hoursPerDay: 8, color: 'bg-green-100 text-green-700' },
    { id: 'backend', label: 'Back-End', rate: 45, hoursPerDay: 8, color: 'bg-purple-100 text-purple-700' }
];

export const DEFAULT_SECTIONS = [
    {
        id: 'sec-1',
        title: 'New Section',
        tasks: []
    }
];

export const DEFAULT_TECH_STACK = {
    development: [{ tool: '', description: '' }],
    infrastructure: [{ tool: '', description: '' }],
    other: [{ tool: '', description: '' }]
};

export const TABS = [
    { id: 'estimation', label: 'Estimation' },
    { id: 'settings', label: 'Settings' },
    { id: 'tech-stack', label: 'Tech Stack' },
    { id: 'questions', label: 'Questions' }
];
