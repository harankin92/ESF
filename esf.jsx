import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Settings, 
  MessageSquare, 
  Layers, 
  Database, 
  Clock, 
  DollarSign,
  Calendar,
  UserPlus,
  Calculator,
  Info,
  ChevronRight
} from 'lucide-react';

const DEFAULT_MANUAL_ROLES = [
  { id: 'mobile', label: 'Mobile', rate: 45, hoursPerDay: 8, color: 'bg-blue-100 text-blue-700' },
  { id: 'frontend', label: 'Front-End', rate: 40, hoursPerDay: 8, color: 'bg-green-100 text-green-700' },
  { id: 'backend', label: 'Back-End', rate: 45, hoursPerDay: 8, color: 'bg-purple-100 text-purple-700' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('estimation');
  const [projectName, setProjectName] = useState('New Project Estimation');
  
  // Состояние ролей (исполнителей)
  const [manualRoles, setManualRoles] = useState(DEFAULT_MANUAL_ROLES);
  
  // Настройки для формул QA и PM
  const [qaPercent, setQaPercent] = useState(20); 
  const [pmPercent, setPmPercent] = useState(15); 
  const [qaRate, setQaRate] = useState(35);
  const [pmRate, setPmRate] = useState(40);

  // Основные данные оценки
  const [sections, setSections] = useState([
    {
      id: 'sec-1',
      title: 'Project Setup & Collateral',
      tasks: [
        { 
          id: 'task-1', 
          name: 'Communication & Scrum', 
          description: 'Daily meetings, planning, demos', 
          relevance: 'common',
          estimates: {
            backend: { min: 4, max: 8 },
            frontend: { min: 4, max: 8 }
          }
        },
        { 
          id: 'task-2', 
          name: 'Environment Setup', 
          description: 'CI/CD, staging and prod servers', 
          relevance: 'must',
          estimates: {
            backend: { min: 8, max: 16 }
          }
        }
      ]
    }
  ]);

  const [techStack, setTechStack] = useState([{ tool: '', description: '' }]);
  const [questions, setQuestions] = useState([{ question: '', answer: '' }]);

  // Централизованные расчеты (Мега-фильтр)
  const totals = useMemo(() => {
    let devOpt = 0;
    let devPess = 0;
    let devCostOpt = 0;
    let devCostPess = 0;

    const roleStats = manualRoles.reduce((acc, r) => {
      acc[r.id] = { min: 0, max: 0, costOpt: 0, costPess: 0 };
      return acc;
    }, {});

    sections.forEach(sec => {
      sec.tasks.forEach(task => {
        manualRoles.forEach(role => {
          const est = task.estimates[role.id] || { min: 0, max: 0 };
          roleStats[role.id].min += est.min;
          roleStats[role.id].max += est.max;
          roleStats[role.id].costOpt += est.min * role.rate;
          roleStats[role.id].costPess += est.max * role.rate;

          devOpt += est.min;
          devPess += est.max;
          devCostOpt += est.min * role.rate;
          devCostPess += est.max * role.rate;
        });
      });
    });

    // QA: % от разработки
    const qaOpt = Math.round(devOpt * (qaPercent / 100));
    const qaPess = Math.round(devPess * (qaPercent / 100));
    const qaCostOpt = qaOpt * qaRate;
    const qaCostPess = qaPess * qaRate;

    // PM: % от (Разработка + QA)
    const pmOpt = Math.round((devOpt + qaOpt) * (pmPercent / 100));
    const pmPess = Math.round((devPess + qaPess) * (pmPercent / 100));
    const pmCostOpt = pmOpt * pmRate;
    const pmCostPess = pmPess * pmRate;

    const totalOptHours = devOpt + qaOpt + pmOpt;
    const totalPessHours = devPess + qaPess + pmPess;
    const totalCostOpt = devCostOpt + qaCostOpt + pmCostOpt;
    const totalCostPess = devCostPess + qaCostPess + pmCostPess;

    // Сроки (недели) по самому загруженному спецу
    const maxWeeks = Math.max(...manualRoles.map(r => {
      const hours = roleStats[r.id].max;
      return r.hoursPerDay > 0 ? hours / (r.hoursPerDay * 5) : 0;
    }), 0);

    return { 
      devOpt, devPess, devCostOpt, devCostPess,
      qaOpt, qaPess, qaCostOpt, qaCostPess,
      pmOpt, pmPess, pmCostOpt, pmCostPess,
      totalOptHours, totalPessHours, totalCostOpt, totalCostPess,
      maxWeeks, roleStats
    };
  }, [sections, manualRoles, qaPercent, pmPercent, qaRate, pmRate]);

  // Хендлеры управления
  const addTask = (sectionId) => {
    setSections(prev => prev.map(s => s.id === sectionId ? {
      ...s, tasks: [...s.tasks, { id: Date.now().toString(), name: '', description: '', relevance: 'must', estimates: {} }]
    } : s));
  };

  const updateTaskEstimate = (secId, taskId, roleId, field, value) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    setSections(prev => prev.map(s => s.id === secId ? {
      ...s, tasks: s.tasks.map(t => t.id === taskId ? {
        ...t, estimates: { ...t.estimates, [roleId]: { ...t.estimates[roleId], [field]: numValue } }
      } : t)
    } : s));
  };

  const updateTaskInfo = (secId, taskId, field, value) => {
    setSections(prev => prev.map(s => s.id === secId ? {
      ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t)
    } : s));
  };

  const addManualRole = () => {
    const id = `role-${Date.now()}`;
    setManualRoles([...manualRoles, { id, label: 'New Specialist', rate: 40, hoursPerDay: 8, color: 'bg-slate-100 text-slate-700' }]);
  };

  const printReport = () => window.print();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 selection:bg-indigo-100">
      {/* Навигация */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Layers size={20} />
            </div>
            <div className="flex flex-col">
              <input 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0 leading-tight"
              />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Antigravity Utility</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button 
              onClick={printReport}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <Download size={18} />
              <span className="font-semibold">Export PDF</span>
            </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {[
            { id: 'estimation', label: 'Estimation', icon: <Clock size={16}/> },
            { id: 'tech-stack', label: 'Tech Stack', icon: <Database size={16}/> },
            { id: 'questions', label: 'Questions', icon: <MessageSquare size={16}/> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* Виджеты статистики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 print:hidden">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-2 opacity-5">
               <Clock size={64} />
            </div>
            <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
              Total Hours
            </div>
            <div className="text-3xl font-black text-slate-800">{totals.totalOptHours}h - {totals.totalPessHours}h</div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full w-fit">
               <Info size={10} /> Auto-calculated
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
              Estimate Budget
            </div>
            <div className="text-3xl font-black text-green-600">
              ${totals.totalCostOpt.toLocaleString()} - ${totals.totalCostPess.toLocaleString()}
            </div>
            <div className="mt-2 text-[10px] text-slate-400">Based on role rates</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
              Timeline
            </div>
            <div className="text-3xl font-black text-slate-800">~{Math.round(totals.maxWeeks)} weeks</div>
            <div className="mt-2 text-[10px] text-slate-400">Parallel dev included</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
              Indirect Effort
            </div>
            <div className="space-y-1">
               <div className="flex justify-between text-xs font-bold">
                 <span className="text-slate-500">QA ({qaPercent}%):</span>
                 <span className="text-indigo-600">{totals.qaPess}h</span>
               </div>
               <div className="flex justify-between text-xs font-bold">
                 <span className="text-slate-500">PM ({pmPercent}%):</span>
                 <span className="text-indigo-600">{totals.pmPess}h</span>
               </div>
            </div>
          </div>
        </div>

        {activeTab === 'estimation' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {sections.map((section) => (
              <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight size={18} className="text-indigo-500" />
                    <input 
                      value={section.title}
                      onChange={(e) => setSections(prev => prev.map(s => s.id === section.id ? {...s, title: e.target.value} : s))}
                      className="font-black bg-transparent border-none focus:ring-0 text-slate-800 text-lg p-0"
                    />
                  </div>
                  <button 
                    onClick={() => addTask(section.id)}
                    className="text-xs flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-all font-bold"
                  >
                    <Plus size={14} /> Add Task
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/30">
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest min-w-[300px]">Features & Scope</th>
                        {manualRoles.map(role => (
                          <th key={role.id} className="px-3 py-4 text-center border-l border-slate-100">
                            <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter mb-1 ${role.color}`}>
                              {role.label}
                            </div>
                            <div className="flex justify-center gap-4 text-[9px] text-slate-400 font-bold">
                              <span>MIN</span>
                              <span>MAX</span>
                            </div>
                          </th>
                        ))}
                        <th className="px-6 py-4 border-l border-slate-100 bg-indigo-50/30 text-center">
                          <div className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1">Row Total</div>
                          <div className="flex justify-center gap-4 text-[9px] text-indigo-300 font-bold">
                            <span>MIN</span>
                            <span>MAX</span>
                          </div>
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {section.tasks.map((task) => {
                        const rowMin = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.min || 0), 0);
                        const rowMax = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.max || 0), 0);
                        
                        return (
                          <tr key={task.id} className="hover:bg-slate-50/30 group transition-all">
                            <td className="px-6 py-5">
                              <input 
                                placeholder="Task title..."
                                value={task.name}
                                onChange={(e) => updateTaskInfo(section.id, task.id, 'name', e.target.value)}
                                className="block w-full font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-800 placeholder:text-slate-300"
                              />
                              <textarea 
                                placeholder="Add technical details..."
                                rows="1"
                                value={task.description}
                                onChange={(e) => updateTaskInfo(section.id, task.id, 'description', e.target.value)}
                                className="block w-full text-xs text-slate-400 bg-transparent border-none focus:ring-0 p-0 resize-none overflow-hidden mt-1 italic placeholder:text-slate-200"
                              />
                            </td>
                            {manualRoles.map(role => (
                              <td key={role.id} className="px-3 py-5 border-l border-slate-50">
                                <div className="flex items-center justify-center gap-1.5">
                                  <input 
                                    type="number"
                                    className="w-12 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-1.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                    value={task.estimates[role.id]?.min || ''}
                                    onChange={(e) => updateTaskEstimate(section.id, task.id, role.id, 'min', e.target.value)}
                                  />
                                  <span className="text-slate-300 font-light">—</span>
                                  <input 
                                    type="number"
                                    className="w-12 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-1.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                    value={task.estimates[role.id]?.max || ''}
                                    onChange={(e) => updateTaskEstimate(section.id, task.id, role.id, 'max', e.target.value)}
                                  />
                                </div>
                              </td>
                            ))}
                            <td className="px-6 py-5 border-l border-slate-100 bg-indigo-50/10">
                               <div className="flex items-center justify-center gap-3 font-black text-indigo-600 text-xs">
                                 <span className="opacity-60">{rowMin}</span>
                                 <span className="text-indigo-200">/</span>
                                 <span>{rowMax}</span>
                               </div>
                            </td>
                            <td className="px-4 py-5 text-right">
                              <button 
                                onClick={() => setSections(sections.map(s => s.id === section.id ? {...s, tasks: s.tasks.filter(t => t.id !== task.id)} : s))}
                                className="text-slate-200 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <button 
              onClick={() => setSections([...sections, { id: Date.now().toString(), title: 'Additional Features', tasks: [] }])}
              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 group"
            >
              <div className="bg-slate-100 p-2 rounded-full group-hover:bg-indigo-100 transition-colors">
                <Plus size={20} />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Create New Section</span>
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800 tracking-tight">
                    <UserPlus className="text-indigo-600" size={28} /> 
                    Project Executors
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 font-medium">Define manual roles and their billing rates.</p>
                </div>
                <button 
                  onClick={addManualRole}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  <Plus size={18} /> Add Role
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {manualRoles.map(role => (
                  <div key={role.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 relative group border-b-4 border-b-slate-200 hover:border-b-indigo-400 transition-all">
                    <button 
                      onClick={() => setManualRoles(manualRoles.filter(r => r.id !== role.id))}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-5">
                      <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Role Name</label>
                        <input 
                          value={role.label}
                          onChange={(e) => setManualRoles(manualRoles.map(r => r.id === role.id ? {...r, label: e.target.value} : r))}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Rate ($/h)</label>
                          <input 
                            type="number"
                            value={role.rate}
                            onChange={(e) => setManualRoles(manualRoles.map(r => r.id === role.id ? {...r, rate: parseInt(e.target.value) || 0} : r))}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Hours/Day</label>
                          <input 
                            type="number"
                            value={role.hoursPerDay}
                            onChange={(e) => setManualRoles(manualRoles.map(r => r.id === role.id ? {...r, hoursPerDay: parseInt(e.target.value) || 0} : r))}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
               <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800 tracking-tight mb-8">
                <Calculator className="text-orange-600" size={28} /> 
                Automatic Formulas (QA & PM)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 border border-orange-100 rounded-2xl bg-orange-50/30">
                  <h3 className="font-black text-orange-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-orange-200 w-2 h-2 rounded-full"></span>
                     Quality Assurance
                  </h3>
                  <div className="space-y-6 text-sm">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                      <span className="text-slate-600 font-bold">QA Load (% of Dev)</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={qaPercent} 
                          onChange={(e) => setQaPercent(parseInt(e.target.value) || 0)}
                          className="w-16 p-1 border-none font-black text-right text-orange-600 focus:ring-0"
                        />
                        <span className="font-bold text-orange-300">%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                      <span className="text-slate-600 font-bold">QA Hourly Rate ($)</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={qaRate} 
                          onChange={(e) => setQaRate(parseInt(e.target.value) || 0)}
                          className="w-16 p-1 border-none font-black text-right text-orange-600 focus:ring-0"
                        />
                        <span className="font-bold text-orange-300">$</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border border-indigo-100 rounded-2xl bg-indigo-50/30">
                  <h3 className="font-black text-indigo-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                     <span className="bg-indigo-200 w-2 h-2 rounded-full"></span>
                     Project Management
                  </h3>
                  <div className="space-y-6 text-sm">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                      <span className="text-slate-600 font-bold">PM Load (% of Dev+QA)</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={pmPercent} 
                          onChange={(e) => setPmPercent(parseInt(e.target.value) || 0)}
                          className="w-16 p-1 border-none font-black text-right text-indigo-600 focus:ring-0"
                        />
                        <span className="font-bold text-indigo-300">%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                      <span className="text-slate-600 font-bold">PM Hourly Rate ($)</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={pmRate} 
                          onChange={(e) => setPmRate(parseInt(e.target.value) || 0)}
                          className="w-16 p-1 border-none font-black text-right text-indigo-600 focus:ring-0"
                        />
                        <span className="font-bold text-indigo-300">$</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Простые вкладки для Tech Stack и Questions */}
        {activeTab === 'tech-stack' && (
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in fade-in duration-300">
             <h2 className="text-2xl font-black mb-8">Technical Stack Definition</h2>
             <div className="space-y-4">
                {techStack.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <input className="w-1/3 p-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Node.js" value={item.tool} onChange={e => {
                      const copy = [...techStack]; copy[idx].tool = e.target.value; setTechStack(copy);
                    }}/>
                    <input className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="What role does it play?" value={item.description} onChange={e => {
                      const copy = [...techStack]; copy[idx].description = e.target.value; setTechStack(copy);
                    }}/>
                    <button onClick={() => setTechStack(techStack.filter((_, i) => i !== idx))} className="text-slate-200 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                ))}
                <button onClick={() => setTechStack([...techStack, {tool: '', description: ''}])} className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:underline py-2">
                  <Plus size={16}/> ADD TOOLING
                </button>
             </div>
           </div>
        )}

        {activeTab === 'questions' && (
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-in fade-in duration-300">
             <h2 className="text-2xl font-black mb-8">Client Questions</h2>
             <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-2xl relative group border border-slate-100">
                    <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-red-500 rounded-full p-1 shadow-sm border opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Question to Stakeholder</label>
                      <textarea className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" rows="2" placeholder="..." value={q.question} onChange={e => {
                        const copy = [...questions]; copy[idx].question = e.target.value; setQuestions(copy);
                      }}/>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Anticipated Answer / Note</label>
                      <textarea className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" rows="2" placeholder="..." value={q.answer} onChange={e => {
                        const copy = [...questions]; copy[idx].answer = e.target.value; setQuestions(copy);
                      }}/>
                    </div>
                  </div>
                ))}
                <button onClick={() => setQuestions([...questions, {question: '', answer: ''}])} className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:underline py-2">
                  <Plus size={16}/> NEW QUESTION
                </button>
             </div>
           </div>
        )}
      </main>

      {/* Профессиональный вид для печати (PDF) */}
      <div className="hidden print:block print:p-0">
        <div className="flex justify-between items-end mb-12 border-b-4 border-indigo-600 pb-6">
          <div>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Project Estimation Artifact</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{projectName}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Generated on {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          <div className="text-right">
             <div className="text-xs font-black text-slate-400 uppercase mb-1">Final Budget Range</div>
             <div className="text-3xl font-black text-indigo-600 tracking-tighter">${totals.totalCostOpt.toLocaleString()} - ${totals.totalCostPess.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
           <div className="p-6 bg-slate-50 rounded-2xl border">
             <h4 className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">Engineering Effort</h4>
             <div className="text-2xl font-black text-slate-800">{totals.devOpt}h - {totals.devPess}h</div>
             <div className="text-[10px] text-slate-400 font-bold mt-1">Core development & setup</div>
           </div>
           <div className="p-6 bg-slate-50 rounded-2xl border">
             <h4 className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">Management & QA</h4>
             <div className="text-2xl font-black text-slate-800">{totals.qaPess + totals.pmPess}h</div>
             <div className="text-[10px] text-slate-400 font-bold mt-1">Quality & delivery oversight</div>
           </div>
           <div className="p-6 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
             <h4 className="text-[9px] font-black uppercase text-indigo-200 mb-2 tracking-widest">Delivery Timeline</h4>
             <div className="text-2xl font-black text-white">~{Math.round(totals.maxWeeks)} Weeks</div>
             <div className="text-[10px] text-indigo-200 font-bold mt-1">Estimated go-live date</div>
           </div>
        </div>

        {sections.map(sec => (
          <div key={sec.id} className="mb-10 avoid-break">
            <h2 className="text-xs font-black bg-slate-900 text-white px-4 py-2 mb-4 uppercase tracking-widest rounded-lg">{sec.title}</h2>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 border border-slate-300 text-left uppercase font-black text-slate-400 w-1/3">Feature</th>
                  {manualRoles.map(r => <th key={r.id} className="p-3 border border-slate-300 text-center uppercase font-black text-slate-400">{r.label}</th>)}
                  <th className="p-3 border border-slate-300 text-center bg-slate-100 uppercase font-black text-slate-700">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {sec.tasks.map(task => {
                   const rowMin = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.min || 0), 0);
                   const rowMax = manualRoles.reduce((sum, r) => sum + (task.estimates[r.id]?.max || 0), 0);
                   return (
                     <tr key={task.id}>
                       <td className="p-3 border border-slate-200">
                         <div className="font-black text-slate-800 text-xs">{task.name}</div>
                         <div className="text-slate-500 italic text-[9px]">{task.description}</div>
                       </td>
                       {manualRoles.map(r => (
                         <td key={r.id} className="p-3 border border-slate-200 text-center font-bold">
                           {task.estimates[r.id]?.max > 0 ? `${task.estimates[r.id]?.min}-${task.estimates[r.id]?.max}` : '—'}
                         </td>
                       ))}
                       <td className="p-3 border border-slate-200 text-center font-black bg-slate-50 text-slate-900 text-xs">
                         {rowMin}-{rowMax}h
                       </td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <div className="mt-12 p-8 border-2 border-slate-100 rounded-3xl bg-slate-50/50 avoid-break relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Calculator size={80} />
          </div>
          <h3 className="font-black text-sm mb-6 uppercase tracking-widest text-slate-400">Calculation Methodology</h3>
          <div className="grid grid-cols-2 gap-12 text-[10px]">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-1 italic"><span>Raw Development (Pessimistic):</span> <span className="font-bold">{totals.devPess}h</span></div>
              <div className="flex justify-between border-b border-slate-200 pb-1 italic"><span>Quality Assurance ({qaPercent}% of dev):</span> <span className="font-bold">{totals.qaPess}h</span></div>
              <div className="flex justify-between border-b border-slate-200 pb-1 italic"><span>Project Management ({pmPercent}% of dev+qa):</span> <span className="font-bold">{totals.pmPess}h</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black text-slate-800"><span>Grand Total Effort:</span> <span>{totals.totalPessHours}h</span></div>
              <div className="flex justify-between text-sm font-black text-indigo-600 pt-2"><span>Total Estimated Project Cost:</span> <span>${totals.totalCostPess.toLocaleString()}</span></div>
              <p className="text-[8px] text-slate-400 mt-4 leading-relaxed">
                Note: This is a preliminary estimation. Actual timelines and costs may vary based on final scope, 3rd party integrations, and requirement shifts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;