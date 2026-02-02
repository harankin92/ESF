const NAV_STATE_KEY = 'esf_nav_state';

export const saveNavState = (state) => {
    try {
        localStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
    } catch (err) {
        console.error('Failed to save navigation state:', err);
    }
};

export const loadNavState = () => {
    try {
        const saved = localStorage.getItem(NAV_STATE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (err) {
        console.error('Failed to load navigation state:', err);
        return null;
    }
};

export const clearNavState = () => {
    try {
        localStorage.removeItem(NAV_STATE_KEY);
    } catch (err) {
        console.error('Failed to clear navigation state:', err);
    }
};
