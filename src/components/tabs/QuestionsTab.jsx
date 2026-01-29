import { Plus, Trash2 } from 'lucide-react';

const QuestionsTab = ({ questions, setQuestions }) => {
    const updateQuestion = (idx, value) => {
        const copy = [...questions];
        copy[idx].question = value;
        setQuestions(copy);
    };

    const deleteQuestion = (idx) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const addQuestion = () => {
        setQuestions([...questions, { question: '' }]);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black mb-2 text-slate-800">Questions & Clarifications</h2>
            <p className="text-slate-400 mb-8 max-w-2xl">List any questions, assumptions, or items that need clarification from the client.</p>

            <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-6">
                <div className="space-y-3">
                    {questions.map((q, idx) => (
                        <div key={idx} className="flex gap-4 items-center group">
                            <span className="text-slate-400 font-bold text-xs w-6 text-center">{idx + 1}.</span>
                            <input
                                className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                placeholder="Type your question here..."
                                value={q.question}
                                onChange={e => updateQuestion(idx, e.target.value)}
                            />
                            <button
                                onClick={() => deleteQuestion(idx)}
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addQuestion}
                        className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all ml-10"
                    >
                        <Plus size={14} /> ADD QUESTION
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionsTab;
