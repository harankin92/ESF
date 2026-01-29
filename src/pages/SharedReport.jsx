import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { calculateTotals } from '../hooks/useTotals';
import ReportContent from '../components/print/ReportContent';
import { createPortal } from 'react-dom';
import { Loader2, Printer, AlertCircle } from 'lucide-react';
import { DEFAULT_SECTIONS, DEFAULT_MANUAL_ROLES } from '../constants/defaults';

const SharedReport = ({ uuid }) => {
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [uuid]);

    const loadData = async () => {
        try {
            // Add cache busting timestamp
            const data = await api.getSharedEstimate(`${uuid}?t=${Date.now()}`);
            setEstimate(data);
        } catch (err) {
            setError('Estimate not found or link expired');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold"><AlertCircle className="mr-2" /> {error}</div>;

    // Prepare props
    const data = estimate.data || {};
    const sections = data.sections || DEFAULT_SECTIONS;
    const manualRoles = data.manualRoles || DEFAULT_MANUAL_ROLES;
    const qaPercent = Number(data.qaPercent || 15);
    const pmPercent = Number(data.pmPercent || 10);
    const qaRate = Number(data.qaRate || 40);
    const pmRate = Number(data.pmRate || 45);
    const discount = Number(data.discount || data.estimateData?.discount || 0);

    // Pass calculateTotals without discount first, as ReportContent expects raw totals for budget range
    // Actually, ReportContent now uses totals.discountedCost if present. 
    // Wait, useTotals calculates discountedCost inside it if we pass discount.
    // So we should pass discount to calculateTotals.

    const totals = calculateTotals(sections, manualRoles, qaPercent, pmPercent, qaRate, pmRate, discount);

    const props = {
        projectName: estimate.name,
        clientName: data.clientName,
        totals,
        sections,
        manualRoles,
        qaPercent,
        pmPercent,
        qaRate,
        pmRate,
        techStack: data.techStack,
        questions: data.questions,
        discount // Explicitly passing it, though it's inside totals too now
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            {/* Top Bar for Screen */}
            <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center screen-only">
                <div />
                <button
                    onClick={() => window.print()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    <Printer size={16} /> Print / PDF
                </button>
            </div>

            {/* Screen Content */}
            <div className="mb-12 screen-only">
                <ReportContent {...props} />
            </div>

            {/* Print Content (Portal) */}
            {createPortal(
                <div className="print-only hidden">
                    <ReportContent {...props} />
                </div>,
                document.body
            )}
        </div>
    );
};

export default SharedReport;
