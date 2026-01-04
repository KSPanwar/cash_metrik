
import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Search, Tag, Building2, Filter, History } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: number;
  selectedYear: number;
  onUpdateCategory: (id: string, category: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  categories, 
  selectedMonth, 
  selectedYear,
  onUpdateCategory 
}) => {
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | TransactionType>('All');
  const [showFullHistory, setShowFullHistory] = useState(false);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const filteredAndSorted = useMemo(() => {
    return [...transactions]
      .filter(t => {
        // Strict month/year filter unless Full History is toggled
        if (!showFullHistory) {
          if (t.date.getMonth() !== selectedMonth || t.date.getFullYear() !== selectedYear) {
            return false;
          }
        }

        const matchesSearch = 
          t.payee.toLowerCase().includes(search.toLowerCase()) || 
          t.remarks.toLowerCase().includes(search.toLowerCase()) ||
          (t.category || '').toLowerCase().includes(search.toLowerCase()) ||
          (t.bank || '').toLowerCase().includes(search.toLowerCase());
        
        const matchesType = filterType === 'All' || t.type === filterType;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortOrder === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return sortOrder === 'asc' 
          ? String(aVal).localeCompare(String(bVal)) 
          : String(bVal).localeCompare(String(aVal));
      });
  }, [transactions, search, filterType, sortField, sortOrder, showFullHistory, selectedMonth, selectedYear]);

  const toggleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-sm"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
            {(['All', 'Debit', 'Credit'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  filterType === type 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type === 'All' ? 'All' : type === 'Debit' ? 'Debits' : 'Credits'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-indigo-50 rounded-2xl border border-indigo-100 w-full lg:w-auto">
          <button 
            onClick={() => setShowFullHistory(false)}
            className={`flex-1 lg:flex-none flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${!showFullHistory ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:bg-white/50'}`}
          >
            <Filter size={14} /> {months[selectedMonth]} {selectedYear}
          </button>
          <button 
            onClick={() => setShowFullHistory(true)}
            className={`flex-1 lg:flex-none flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${showFullHistory ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:bg-white/50'}`}
          >
            <History size={14} /> All History
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b flex items-center justify-between">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {showFullHistory ? 'Global Transaction Log' : `Records for ${months[selectedMonth]} ${selectedYear}`}
          </h3>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
            {filteredAndSorted.length} Results
          </span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-gray-50/30">
              <tr>
                <Th label="Date" field="date" onSort={toggleSort} active={sortField === 'date'} order={sortOrder} />
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Bank</th>
                <Th label="Payee / Category" field="payee" onSort={toggleSort} active={sortField === 'payee'} order={sortOrder} />
                <Th label="Amount" field="amount" onSort={toggleSort} active={sortField === 'amount'} order={sortOrder} />
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSorted.map(t => {
                const currentCat = categories.find(c => c.id === t.category);
                return (
                  <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5 text-gray-500 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{t.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                      <div className="text-[10px] text-gray-400">{t.date.getFullYear()}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-gray-300" />
                        <span className="text-[10px] font-black text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded tracking-tighter">
                          {t.bank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-gray-900 leading-none group-hover:text-indigo-600 transition-colors">{t.payee}</span>
                        <div className="flex items-center gap-1.5">
                          <Tag size={10} className={`${currentCat?.type === 'Income' ? 'text-green-500' : currentCat?.type === 'Savings' ? 'text-amber-500' : 'text-rose-500'}`} />
                          <select 
                            value={t.category || 'Other'}
                            onChange={(e) => onUpdateCategory(t.id, e.target.value)}
                            className={`text-[10px] font-bold py-0.5 px-1.5 rounded-lg border-none outline-none focus:ring-1 cursor-pointer transition-all ${
                              currentCat?.type === 'Income' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                              currentCat?.type === 'Savings' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                              'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            }`}
                          >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                          </select>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-5 font-black whitespace-nowrap ${t.type === 'Debit' ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {t.type === 'Debit' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-gray-400 text-xs max-w-xs truncate" title={t.remarks}>
                      {t.remarks}
                    </td>
                  </tr>
                );
              })}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                      <Search size={40} className="opacity-20" />
                      <p className="italic text-sm">No transactions found for {showFullHistory ? 'your search criteria' : `${months[selectedMonth]} ${selectedYear}`}.</p>
                      {!showFullHistory && (
                        <button 
                          onClick={() => setShowFullHistory(true)}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Check Entire History instead?
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Th = ({ label, field, onSort, active, order }: any) => (
  <th onClick={() => onSort(field)} className="px-6 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
    <div className="flex items-center gap-2">
      <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">{label}</span>
      {active && (order === 'asc' ? <ArrowUp size={12} className="text-indigo-500" /> : <ArrowDown size={12} className="text-indigo-500" />)}
    </div>
  </th>
);

export default TransactionTable;
