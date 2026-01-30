import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <div className="flex items-center gap-3 mb-2 font-bold">
                        <AlertTriangle size={24} />
                        <h3>Something went wrong in this component</h3>
                    </div>
                    <pre className="text-xs bg-red-100 p-2 rounded overflow-auto mb-2 font-mono">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <details className="text-xs text-red-500 whitespace-pre-wrap">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
