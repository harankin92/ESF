import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
                        <Layers size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">ESF Estimator</h1>
                    <p className="text-indigo-300 text-sm mt-1">Project Estimation Tool</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider block mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider block mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
                        >
                            {loading ? (
                                <span className="animate-pulse">Signing in...</span>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-indigo-300 mb-3 font-medium">Demo Accounts:</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                            {[
                                { email: 'admin@test.com', role: 'Admin' },
                                { email: 'sale@test.com', role: 'Sale' },
                                { email: 'presale@test.com', role: 'PreSale' },
                                { email: 'techlead@test.com', role: 'TechLead' },
                                { email: 'pm@test.com', role: 'PM' }
                            ].map(acc => (
                                <button
                                    key={acc.email}
                                    type="button"
                                    onClick={() => {
                                        setEmail(acc.email);
                                        setPassword(acc.email.split('@')[0] + '123');
                                    }}
                                    className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all text-left"
                                >
                                    <span className="font-bold">{acc.role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
