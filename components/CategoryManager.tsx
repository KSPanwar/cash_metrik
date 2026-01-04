
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Tag, TrendingUp, TrendingDown, PiggyBank, X, Calendar, Search, Download, Upload as UploadIcon, Share2, ShieldCheck } from 'lucide-react';
import { Transaction, Category, CategoryType } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  transactions: Transaction[];
  selectedYear: number;
  payeeMap: Record<string, string>;
  onAddCategory: (category: Category) => void;
  onRemoveCategory: (categoryId: string) => void;
  onExportRules: () => void;
  onImportRules: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  transactions, 
  selectedYear, 
  payeeMap,
  onAddCategory, 
  onRemoveCategory,
  onExportRules,
  onImportRules
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>('Expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryStats = (categoryId: string) => {
    const relevantTxns = transactions.filter(t => t.category === categoryId && t.date.getFullYear() === selectedYear);
    const catType = categories.find(c => c.id === categoryId)?.type || 'Expense';
    const total = relevantTxns.reduce((s, t) => {
      if (catType === 'Income') {
        return s + (t.type === 'Credit' ? t.amount : -t.amount);
      } else {
        return s + (t.type === 'Debit' ? t.amount : -t.amount);
      }
    }, 0);

    return { total, count: relevantTxns.length, txns: relevantTxns };
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed && !categories.some(c => c.id.toLowerCase() === trimmed.toLowerCase())) {
      onAddCategory({ id: trimmed, type: newCategoryType });
      setNewCategoryName('');
    }
  };

  const getTypeStyles = (type: CategoryType) => {
    switch (type) {
      case 'Income': return 'bg-green-50 text-green-600 border-green-100';
      case 'Expense': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Savings': return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const getTypeIcon = (type: CategoryType) => {
    switch (type) {
      case 'Income': return <TrendingUp size={14} />;
      case 'Expense': return <TrendingDown size={14} />;
      case 'Savings': return <PiggyBank size={14} />;
    }
  };

  const ruleCount = Object.keys(payeeMap).length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tag Architecture ({selectedYear})</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">Classify your cashflow with custom mappings. Each year is a fresh start for metrics, but your learned rules stay with you.</p>
          
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 p-3 bg-white border rounded-[2rem] shadow-sm hover:shadow-md transition-shadow max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="New tag (e.g. Freelance, Rent...)" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 bg-transparent px-6 py-3 outline-none text-sm font-medium"
            />
            <div className="flex gap-2 p-1 bg-gray-50 rounded-full">
              {(['Income', 'Expense', 'Savings'] as CategoryType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewCategoryType(t)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${
                    newCategoryType === t 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button 
              type="submit" 
              disabled={!newCategoryName.trim()}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-gray-200 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={18} /> Add Tag
            </button>
          </form>
        </div>

        {/* Sync & Backup Section */}
        <div className="bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="bg-white p-4 rounded-3xl text-indigo-600 shadow-sm border border-indigo-100">
            <Share2 size={32} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-black text-indigo-900 mb-1">Intelligence & Backup</h3>
            <p className="text-xs text-indigo-500 font-medium leading-relaxed">
              The app has learned <span className="font-black text-indigo-700">{ruleCount} auto-tagging rules</span>. 
              Download your registry to keep them safe or move them to a new device.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={onExportRules}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
            >
              <Download size={14} /> Export Rules
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              <UploadIcon size={14} /> Import Rules
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={onImportRules}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => {
          const stats = getCategoryStats(cat.id);
          const isSystem = ['Other', 'Savings', 'Self'].includes(cat.id);
          
          return (
            <div 
              key={cat.id} 
              onClick={() => setSelectedCategoryId(cat.id)}
              className="bg-white border rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group border-gray-100 relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl ${getTypeStyles(cat.type)}`}>
                  <Tag size={24} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase border flex items-center gap-1 ${getTypeStyles(cat.type)}`}>
                    {getTypeIcon(cat.type)} {cat.type}
                  </div>
                  {!isSystem && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCategory(cat.id);
                      }}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {isSystem && (
                    <span className="text-[8px] font-black uppercase text-gray-300 tracking-widest px-2 py-1">Internal</span>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-1">{cat.id}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{stats.count} Records in {selectedYear}</p>
              
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Annual Flow ({selectedYear})</span>
                  <span className={`text-sm font-black ${cat.type === 'Income' ? 'text-green-600' : cat.type === 'Savings' ? 'text-amber-600' : 'text-rose-600'}`}>
                    ₹{stats.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">View {selectedYear} Records</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCategoryId && (
        <CategoryDetailModal 
          categoryId={selectedCategoryId}
          category={categories.find(c => c.id === selectedCategoryId)!}
          transactions={transactions.filter(t => t.category === selectedCategoryId && t.date.getFullYear() === selectedYear)}
          selectedYear={selectedYear}
          onClose={() => setSelectedCategoryId(null)}
        />
      )}
    </div>
  );
};

const CategoryDetailModal = ({ categoryId, category, transactions, selectedYear, onClose }: { categoryId: string, category: Category, transactions: Transaction[], selectedYear: number, onClose: () => void }) => {
  const sortedTxns = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const totalAmount = transactions.reduce((s, t) => {
    if (category.type === 'Income') {
      return s + (t.type === 'Credit' ? t.amount : -t.amount);
    } else {
      return s + (t.type === 'Debit' ? t.amount : -t.amount);
    }
  }, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b flex items-start justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm`}>
                <Tag size={20} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">{categoryId}</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{transactions.length} Records in {selectedYear}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                category.type === 'Income' ? 'bg-green-50 text-green-600 border-green-100' :
                category.type === 'Savings' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {category.type}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Yearly Net Flow</p>
            <p className={`text-2xl font-black ${category.type === 'Income' ? 'text-green-600' : 'text-gray-900'}`}>₹{totalAmount.toLocaleString('en-IN')}</p>
            <button 
              onClick={onClose} 
              className="mt-4 p-2 bg-white border border-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4 bg-white">
          {sortedTxns.length === 0 ? (
            <div className="py-20 text-center text-gray-400 italic font-medium">No records found for this tag in {selectedYear}.</div>
          ) : (
            sortedTxns.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-gray-900 truncate">{t.payee}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">{t.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400 truncate">{t.remarks || 'No remarks'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className={`text-sm font-black ${t.type === 'Debit' ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {t.type === 'Debit' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[8px] font-black uppercase text-gray-300 tracking-tighter bg-gray-100 px-1 py-0.5 rounded">{t.bank}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 bg-gray-50 border-t flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Viewing {selectedYear} Archive</span>
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-800 transition-colors">Close View</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
