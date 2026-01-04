
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Upload, 
  Calendar as CalendarIcon, 
  List, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Download,
  Trash2,
  TrendingUp,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  X,
  Building2,
  PieChart as PieChartIcon,
  BarChart3,
  PiggyBank,
  Globe,
  Snowflake,
  Flower2,
  Sun,
  Leaf,
  CloudRain,
  Wind,
  Palmtree,
  Trees,
  Search,
  LayoutGrid,
  SunMedium,
  Moon,
  Tags,
  Share2,
  HelpCircle,
  MessageCircle,
  Info
} from 'lucide-react';
import { Transaction, ViewTab, BankType, Category, CategoryType } from './types';
import { parseExcelStatement } from './utils/parser';
import CalendarView from './components/CalendarView';
import TransactionTable from './components/TransactionTable';
import GroupedView from './components/GroupedView';
import ExpenseChart from './components/ExpenseChart';
import CategoryChart from './components/CategoryChart';
import YearlyView from './components/YearlyView';
import CategoryManager from './components/CategoryManager';
import { HowToUse, AboutMe, Feedback } from './components/SupportViews';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'Food', type: 'Expense' },
  { id: 'Travel', type: 'Expense' },
  { id: 'Fuel', type: 'Expense' },
  { id: 'Shopping', type: 'Expense' },
  { id: 'Rent', type: 'Expense' },
  { id: 'Health', type: 'Expense' },
  { id: 'Utilities', type: 'Expense' },
  { id: 'Savings', type: 'Savings' },
  { id: 'Salary', type: 'Income' },
  { id: 'Self', type: 'Income' },
  { id: 'Other', type: 'Expense' }
];

const MONTH_THEMES: Record<number, { icon: any, color: string, accent: string, season: string, bgClass: string, text: string }> = {
  0: { icon: <Snowflake size={24} />, color: 'from-blue-50 to-indigo-100', accent: 'text-blue-600', season: 'Winter', bgClass: 'bg-blue-50/60', text: 'text-slate-800' },
  1: { icon: <Snowflake size={24} />, color: 'from-indigo-50 to-purple-100', accent: 'text-indigo-600', season: 'Winter', bgClass: 'bg-indigo-50/60', text: 'text-slate-800' },
  2: { icon: <Flower2 size={24} />, accent: 'text-pink-600', season: 'Spring', bgClass: 'bg-rose-50/60', text: 'text-slate-800', color: 'from-pink-50 to-rose-100' },
  3: { icon: <Flower2 size={24} />, color: 'from-rose-50 to-pink-100', accent: 'text-rose-600', season: 'Spring', bgClass: 'bg-pink-50/60', text: 'text-slate-800' },
  4: { icon: <SunMedium size={24} />, color: 'from-green-50 to-emerald-100', accent: 'text-emerald-600', season: 'Spring', bgClass: 'bg-emerald-50/60', text: 'text-slate-800' },
  5: { icon: <CloudRain size={24} />, color: 'from-cyan-50 to-blue-100', accent: 'text-cyan-600', season: 'Monsoon', bgClass: 'bg-cyan-50/60', text: 'text-slate-800' },
  6: { icon: <Sun size={24} />, color: 'from-orange-50 to-red-100', accent: 'text-orange-600', season: 'Summer', bgClass: 'bg-orange-50/60', text: 'text-slate-800' },
  7: { icon: <Palmtree size={24} />, color: 'from-amber-50 to-orange-100', accent: 'text-amber-600', season: 'Summer', bgClass: 'bg-amber-50/60', text: 'text-slate-800' },
  8: { icon: <Leaf size={24} />, color: 'from-orange-100 to-amber-100', accent: 'text-orange-700', season: 'Autumn', bgClass: 'bg-orange-50/60', text: 'text-slate-800' },
  9: { icon: <Wind size={24} />, color: 'from-purple-50 to-indigo-100', accent: 'text-purple-600', season: 'Autumn', bgClass: 'bg-indigo-50/60', text: 'text-slate-800' },
  10: { icon: <Trees size={24} />, color: 'from-slate-50 to-stone-100', accent: 'text-stone-600', season: 'Autumn', bgClass: 'bg-stone-50/60', text: 'text-slate-800' },
  11: { icon: <Snowflake size={24} />, color: 'from-red-50 to-emerald-50', accent: 'text-rose-600', season: 'Winter', bgClass: 'bg-indigo-50/60', text: 'text-slate-800' },
};

const App: React.FC = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('zenfinance_txns');
    if (!saved) return [];
    try {
      return JSON.parse(saved).map((t: any) => ({ ...t, date: new Date(t.date) }));
    } catch { return []; }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('zenfinance_categories_v2');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [payeeMap, setPayeeMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('zenfinance_payee_map');
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isMonthGridOpen, setIsMonthGridOpen] = useState(false);
  const [isThemedBg, setIsThemedBg] = useState(true);
  
  const [selectedBank, setSelectedBank] = useState<BankType>('PNB');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentTheme = MONTH_THEMES[selectedMonth];

  useEffect(() => {
    localStorage.setItem('zenfinance_txns', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('zenfinance_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('zenfinance_payee_map', JSON.stringify(payeeMap));
  }, [payeeMap]);

  const yearOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);
  }, [currentYear]);

  useEffect(() => {
    document.body.style.transition = 'background 0.5s ease-in-out';
    if (isThemedBg) {
      document.body.className = `custom-scrollbar transition-all duration-700 ${currentTheme.bgClass}`;
    } else {
      document.body.className = 'custom-scrollbar transition-all duration-700 bg-slate-50';
    }
  }, [isThemedBg, selectedMonth, currentTheme]);

  const getCategoryType = (catId: string | undefined): CategoryType => {
    const found = categories.find(c => c.id === catId);
    return found ? found.type : 'Expense';
  };

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.date.getMonth() === selectedMonth && 
      t.date.getFullYear() === selectedYear
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, selectedMonth, selectedYear]);

  const yearTransactions = useMemo(() => {
    return transactions.filter(t => t.date.getFullYear() === selectedYear);
  }, [transactions, selectedYear]);

  const calculateStats = (txns: Transaction[]) => {
    let income = 0;
    let expense = 0;
    let savings = 0;

    txns.forEach(t => {
      if (t.category === 'Self') return;
      const catType = getCategoryType(t.category);
      
      if (catType === 'Income') {
        income += (t.type === 'Credit' ? t.amount : -t.amount);
      } else if (catType === 'Expense') {
        expense += (t.type === 'Debit' ? t.amount : -t.amount);
      } else if (catType === 'Savings') {
        savings += (t.type === 'Debit' ? t.amount : -t.amount);
      }
    });

    return { income, expense, savings, net: income - expense - savings };
  };

  const stats = useMemo(() => calculateStats(monthlyTransactions), [monthlyTransactions, categories]);
  const lifetimeStats = useMemo(() => calculateStats(transactions), [transactions, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setPassword('');
    }
  };

  const handleParse = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseExcelStatement(selectedFile, selectedBank, password);
      setTransactions(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const uniqueNew = parsed
          .filter(t => !existingIds.has(t.id))
          .map(t => ({ 
            ...t, 
            category: payeeMap[t.payee] || 'Other' 
          }));
        if (uniqueNew.length === 0 && parsed.length > 0) {
          setError('All transactions already imported.');
          return prev;
        }
        return [...prev, ...uniqueNew];
      });
      setSelectedFile(null);
      setPassword('');
    } catch (err: any) {
      setError(err.message === 'PASSWORD_REQUIRED' ? 'Password required.' : (err.message === 'WRONG_PASSWORD' ? 'Incorrect password.' : 'Failed to parse.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayeeCategory = (payeeName: string, categoryId: string) => {
    setPayeeMap(prev => ({ ...prev, [payeeName]: categoryId }));
    setTransactions(prev => prev.map(t => t.payee === payeeName ? { ...t, category: categoryId } : t));
  };

  const handleExportMappings = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payeeMap, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `CashMertik_Payee_Rules_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportMappings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedMap = JSON.parse(event.target?.result as string);
        if (typeof importedMap === 'object' && importedMap !== null) {
          setPayeeMap(prev => ({ ...prev, ...importedMap }));
          setTransactions(prev => prev.map(t => {
            if (t.category === 'Other' && importedMap[t.payee]) {
              return { ...t, category: importedMap[t.payee] };
            }
            return t;
          }));
          alert('Successfully imported mapping rules!');
        }
      } catch (err) {
        alert('Failed to parse the mapping file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setTransactions([]);
      localStorage.removeItem('zenfinance_txns');
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const isFutureMonthYear = (m: number, y: number) => {
    if (y > currentYear) return true;
    if (y === currentYear && m > currentMonth) return true;
    return false;
  };

  const handlePrevMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 0) {
        setSelectedYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    if (isFutureMonthYear((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)) return;
    setSelectedMonth(prev => {
      if (prev === 11) {
        setSelectedYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700`}>
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('calendar')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CashMertik</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsThemedBg(!isThemedBg)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isThemedBg ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {isThemedBg ? <Moon size={14} /> : <SunMedium size={14} />}
              <span className="hidden sm:inline">{isThemedBg ? 'Immersive Mode' : 'Clean Mode'}</span>
            </button>
            <button onClick={clearData} className="text-gray-400 hover:text-red-600 p-2 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Only show core widgets if we are in core finance tabs */}
        {['calendar', 'all', 'grouped', 'yearly', 'categories'].includes(activeTab) && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-3xl border p-6 shadow-sm min-h-[220px] flex flex-col justify-center">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2"><Upload size={16} /> Import Statement</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Select Bank:</span>
                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value as BankType)} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border-none outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer">
                      <option value="PNB">PNB</option>
                      <option value="HDFC">HDFC</option>
                      <option value="SBI">SBI</option>
                    </select>
                  </div>
                </div>
                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <Download className="w-6 h-6 text-gray-400 mb-3" />
                      <p className="mb-1 text-sm text-gray-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400">Excel Statement (.xls, .xlsx)</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".xls,.xlsx,.csv" className="hidden" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
                      <FileSpreadsheet className="text-indigo-600" size={24} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">Format: {selectedBank}</p>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="p-1.5 hover:bg-indigo-200 text-indigo-400 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input type="password" placeholder="Password (optional)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleParse()} className="flex-1 px-4 py-2.5 bg-gray-50 border rounded-xl outline-none" />
                      <button onClick={handleParse} disabled={isLoading} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-400 transition-all shadow-lg shadow-indigo-100">
                        {isLoading ? 'Parsing...' : 'Parse'}
                      </button>
                    </div>
                  </div>
                )}
                {error && <p className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">{error}</p>}
              </div>

              <div className={`rounded-3xl border border-slate-200 shadow-xl flex flex-col relative overflow-hidden h-[220px] bg-gradient-to-br ${currentTheme.color} transition-all duration-700`}>
                <div className="relative p-6 h-full flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-[10px] font-black uppercase flex items-center gap-2 ${currentTheme.text} opacity-80`}>
                      <span className={`p-2 bg-white rounded-xl shadow-sm ${currentTheme.accent}`}>{currentTheme.icon}</span> 
                      <span className="tracking-[0.3em] font-bold">{currentTheme.season}</span>
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={() => setIsMonthGridOpen(!isMonthGridOpen)} className={`p-2 rounded-xl transition-all ${isMonthGridOpen ? 'bg-white text-indigo-900 shadow-lg' : 'bg-white/60 text-slate-700 hover:bg-white shadow-sm'}`}>
                        <LayoutGrid size={18} />
                      </button>
                      <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className={`text-xs font-bold bg-white/60 text-slate-700 px-3 py-1.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer shadow-sm`}>
                        {yearOptions.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                      </select>
                    </div>
                  </div>

                  {isMonthGridOpen ? (
                    <div className="grid grid-cols-4 gap-2 mt-4 animate-in fade-in zoom-in-95 duration-200">
                      {months.map((m, idx) => {
                        const future = isFutureMonthYear(idx, selectedYear);
                        return (
                          <button key={m} disabled={future} onClick={() => { setSelectedMonth(idx); setIsMonthGridOpen(false); }} className={`py-2 text-[10px] font-bold rounded-lg transition-all ${selectedMonth === idx ? 'bg-indigo-600 text-white shadow-md' : future ? 'opacity-30 cursor-not-allowed bg-slate-200 text-slate-400' : 'bg-white/60 text-slate-600 hover:bg-white'}`}>
                            {m.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 py-8">
                      <button onClick={handlePrevMonth} className="p-3 bg-white border border-slate-100 rounded-full hover:bg-indigo-50 hover:text-indigo-900 transition-all text-slate-600 shadow-md">
                        <ChevronLeft size={24} />
                      </button>
                      <div className="text-center group cursor-pointer" onClick={() => setIsMonthGridOpen(true)}>
                        <div className={`text-4xl font-black ${currentTheme.text} tracking-tighter scale-100 group-hover:scale-105 transition-transform duration-300`}>
                          {months[selectedMonth]}
                        </div>
                        <div className={`text-[10px] font-black ${currentTheme.text} opacity-50 uppercase tracking-[0.5em] mt-2`}>{selectedYear}</div>
                      </div>
                      <button onClick={handleNextMonth} disabled={isFutureMonthYear((selectedMonth + 1) % 12, selectedMonth === 11 ? selectedYear + 1 : selectedYear)} className={`p-3 bg-white border border-slate-100 rounded-full hover:bg-indigo-50 hover:text-indigo-900 transition-all text-slate-600 shadow-md disabled:opacity-30 disabled:cursor-not-allowed`}>
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000 ease-out">
                <Globe size={180} />
              </div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 py-4">
                <div className="text-center space-y-2">
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Lifetime Portfolio</p>
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Consolidated Wealth</h2>
                </div>
                <div className="h-16 w-px bg-indigo-800/50 hidden lg:block" />
                <div className="text-center group/item">
                  <p className="text-indigo-400 text-[10px] uppercase font-bold mb-1 tracking-widest opacity-70">Asset Savings</p>
                  <p className="text-5xl font-black text-emerald-400/90 group-hover:text-emerald-300 transition-all duration-500">₹{lifetimeStats.savings.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Expenses" amount={stats.expense} color="red" icon={<TrendingUp />} />
              <StatCard title="Income" amount={stats.income} color="green" icon={<CreditCard />} />
              <StatCard title="Savings" amount={stats.savings} color="amber" icon={<PiggyBank />} />
              <StatCard title="Net Balance" amount={stats.net} color="indigo" icon={<DollarSign />} />
            </section>
          </>
        )}

        <section className="bg-white/95 backdrop-blur-sm rounded-3xl border shadow-xl overflow-hidden border-white/40">
          <div className="flex border-b overflow-x-auto custom-scrollbar bg-gray-50/50">
            <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={18} />} label="Calendar" />
            <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<List size={18} />} label="All Records" />
            <TabButton active={activeTab === 'grouped'} onClick={() => setActiveTab('grouped')} icon={<Users size={18} />} label="Payee Groups" />
            <TabButton active={activeTab === 'yearly'} onClick={() => setActiveTab('yearly')} icon={<BarChart3 size={18} />} label="Analytics" />
            <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Tags size={18} />} label="Tag Manager" />
            {/* Context-aware secondary tabs if they were triggered via footer */}
            {activeTab === 'how-to' && <TabButton active={true} onClick={() => {}} icon={<HelpCircle size={18} />} label="Guide" />}
            {activeTab === 'about' && <TabButton active={true} onClick={() => {}} icon={<Info size={18} />} label="About" />}
            {activeTab === 'feedback' && <TabButton active={true} onClick={() => {}} icon={<MessageCircle size={18} />} label="Support" />}
          </div>

          <div className="p-8">
            {activeTab === 'calendar' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <TrendingUp size={14} className="text-indigo-500" /> Daily Spend Velocity
                    </h2>
                    <div className="h-[220px]"><ExpenseChart transactions={monthlyTransactions} categories={categories} month={selectedMonth} year={selectedYear} /></div>
                  </div>
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <PieChartIcon size={14} className="text-rose-500" /> Sector Allocation
                    </h2>
                    <div className="h-[220px]"><CategoryChart transactions={monthlyTransactions} categories={categories} /></div>
                  </div>
                </div>
                <CalendarView transactions={monthlyTransactions} month={selectedMonth} year={selectedYear} categories={categories} onAddTransaction={(txn) => setTransactions(prev => [...prev, { ...txn, id: `manual-${Date.now()}`, bank: 'Manual' }])} />
              </>
            )}
            {activeTab === 'all' && (
              <TransactionTable 
                transactions={transactions} 
                categories={categories} 
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onUpdateCategory={(id, cat) => {
                  const txn = transactions.find(t => t.id === id);
                  if (txn) {
                    handleUpdatePayeeCategory(txn.payee, cat);
                  }
                }} 
              />
            )}
            {activeTab === 'grouped' && (
              <GroupedView 
                transactions={monthlyTransactions} 
                categories={categories} 
                onUpdatePayeeCategory={handleUpdatePayeeCategory} 
              />
            )}
            {activeTab === 'yearly' && <YearlyView transactions={yearTransactions} year={selectedYear} categories={categories} />}
            {activeTab === 'categories' && (
              <CategoryManager 
                categories={categories} 
                transactions={transactions}
                selectedYear={selectedYear}
                payeeMap={payeeMap}
                onAddCategory={(cat) => setCategories(prev => [...prev, cat])} 
                onRemoveCategory={(catId) => setCategories(prev => prev.filter(c => c.id !== catId))}
                onExportRules={handleExportMappings}
                onImportRules={handleImportMappings}
              />
            )}
            {activeTab === 'how-to' && <HowToUse />}
            {activeTab === 'about' && <AboutMe />}
            {activeTab === 'feedback' && <Feedback />}
          </div>
        </section>
      </main>
      
      <footer className="mt-auto py-12 bg-white/50 backdrop-blur-sm border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2 text-indigo-600">
              <ShieldCheck size={20} strokeWidth={3} />
              <span className="text-sm font-black uppercase tracking-widest">CashMertik</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-8">
              <FooterLink active={activeTab === 'how-to'} onClick={() => setActiveTab('how-to'} label="How it Works" icon={<HelpCircle size={14} />} />
              <FooterLink active={activeTab === 'about'} onClick={() => setActiveTab('about')} label="About Me" icon={<Info size={14} />} />
              <FooterLink active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} label="Feedback" icon={<MessageCircle size={14} />} />
            </nav>

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
              © {new Date().getFullYear()} • PRIVACY FIRST
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              Built locally. Processed locally. Your data belongs to you.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FooterLink = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'}`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ title, amount, icon, color }: any) => (
  <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border border-white/40 shadow-sm flex items-start justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <p className={`text-2xl font-black ${amount < 0 ? 'text-rose-600' : 'text-gray-900'}`}>₹{Math.abs(amount).toLocaleString('en-IN')}</p>
    </div>
    <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 shadow-sm`}>{icon}</div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-8 py-5 text-xs font-black uppercase tracking-[0.15em] transition-all border-b-2 whitespace-nowrap ${active ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
    {icon} <span>{label}</span>
  </button>
);

export default App;
