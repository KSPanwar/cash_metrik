
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Tag, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction, Category } from '../types';

interface GroupedViewProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdatePayeeCategory: (payeeName: string, category: string) => void;
}

interface GroupInfo {
  name: string;
  inflow: number;
  outflow: number;
  net: number;
  count: number;
  category: string;
  transactions: Transaction[];
}

const GroupedView: React.FC<GroupedViewProps> = ({ transactions, categories, onUpdatePayeeCategory }) => {
  const [expandedPayee, setExpandedPayee] = useState<string | null>(null);

  const grouped = transactions.reduce((acc, t) => {
    if (!acc[t.payee]) {
      acc[t.payee] = {
        name: t.payee,
        inflow: 0,
        outflow: 0,
        net: 0,
        count: 0,
        category: t.category || 'Other',
        transactions: []
      };
    }
    
    if (t.type === 'Debit') {
      acc[t.payee].outflow += t.amount;
    } else {
      acc[t.payee].inflow += t.amount;
    }
    
    acc[t.payee].count += 1;
    acc[t.payee].transactions.push(t);
    acc[t.payee].category = t.category || 'Other';
    acc[t.payee].net = acc[t.payee].inflow - acc[t.payee].outflow;
    
    return acc;
  }, {} as Record<string, GroupInfo>);

  const sortedGroups = (Object.values(grouped) as GroupInfo[])
    .sort((a, b) => (b.outflow + b.inflow) - (a.outflow + a.inflow));

  const maxTotalFlow = Math.max(...sortedGroups.map(g => Math.abs(g.net)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500">Group analytics consolidated by Payee. Credits reduce the net outflow (spent) automatically.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedGroups.map(group => {
          const isExpanded = expandedPayee === group.name;
          const currentCat = categories.find(c => c.id === group.category);
          
          return (
            <div 
              key={group.name} 
              className={`bg-white border rounded-2xl transition-all shadow-sm ${isExpanded ? 'ring-2 ring-indigo-500 border-transparent' : 'hover:border-indigo-200'}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpandedPayee(isExpanded ? null : group.name)}>
                    <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{group.name}</h3>
                    <p className="text-xs text-gray-500">{group.count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${group.net >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                       ₹{Math.abs(group.net).toLocaleString('en-IN')}
                    </p>
                    <button 
                      onClick={() => setExpandedPayee(isExpanded ? null : group.name)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors mt-1"
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Tag size={12} className={currentCat?.type === 'Income' ? 'text-green-500' : currentCat?.type === 'Savings' ? 'text-amber-500' : 'text-rose-500'} />
                  <div className="relative flex-1 max-w-[220px]">
                    <select 
                      value={group.category}
                      onChange={(e) => onUpdatePayeeCategory(group.name, e.target.value)}
                      className={`w-full text-xs font-bold px-3 py-1.5 rounded-lg border-none outline-none focus:ring-2 cursor-pointer appearance-none ${
                        currentCat?.type === 'Income' ? 'bg-green-50 text-green-700 focus:ring-green-300' :
                        currentCat?.type === 'Savings' ? 'bg-amber-50 text-amber-700 focus:ring-amber-300' :
                        'bg-indigo-50 text-indigo-700 focus:ring-indigo-300'
                      }`}
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.id} ({c.type})</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500">
                      <ChevronDown size={12} />
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden" onClick={() => setExpandedPayee(isExpanded ? null : group.name)}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${group.net >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${(Math.abs(group.net) / maxTotalFlow) * 100}%` }}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t bg-gray-50/50 rounded-b-2xl animate-in slide-in-from-top-2 duration-300">
                   <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">History</p>
                    <div className="flex gap-4">
                      {group.inflow > 0 && <span className="text-[10px] text-emerald-600 font-bold uppercase">Total In: ₹{group.inflow.toLocaleString()}</span>}
                      {group.outflow > 0 && <span className="text-[10px] text-rose-500 font-bold uppercase">Total Out: ₹{group.outflow.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {group.transactions.map(t => (
                      <div key={t.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="min-w-0 flex-1 mr-4">
                          <p className="text-xs font-semibold text-gray-700 truncate">{t.remarks}</p>
                          <p className="text-[10px] text-gray-400">{t.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        </div>
                        <span className={`text-sm font-bold ${t.type === 'Debit' ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {t.type === 'Debit' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedGroups.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 italic">
            No data found to group.
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupedView;
