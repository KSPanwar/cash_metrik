
import React, { useMemo, useState } from 'react';
import { Search, TrendingDown } from 'lucide-react';
import { Transaction, Category } from '../types';
import CategoryChart from './CategoryChart';
import { BarChart as ReChartsBarChart, Bar as ReChartsBar, XAxis as ReChartsXAxis, YAxis as ReChartsYAxis, CartesianGrid as ReChartsCartesianGrid, Tooltip as ReChartsTooltip, ResponsiveContainer as ReChartsResponsiveContainer, Legend as ReChartsLegend } from 'recharts';

interface YearlyViewProps {
  transactions: Transaction[];
  year: number;
  categories: Category[];
}

const YearlyView: React.FC<YearlyViewProps> = ({ transactions, year, categories }) => {
  const [payeeSearch, setPayeeSearch] = useState('');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getCategoryType = (catId: string | undefined) => {
    return categories.find(c => c.id === catId)?.type || 'Expense';
  };

  const calculateStats = (txns: Transaction[]) => {
    let earned = 0;
    let spent = 0;
    let saved = 0;

    txns.forEach(t => {
      if (t.category === 'Self') return;
      const type = getCategoryType(t.category);
      if (type === 'Income') earned += (t.type === 'Credit' ? t.amount : -t.amount);
      else if (type === 'Expense') spent += (t.type === 'Debit' ? t.amount : -t.amount);
      else if (type === 'Savings') saved += (t.type === 'Debit' ? t.amount : -t.amount);
    });

    return { earned, spent, saved };
  };

  const yearlyData = useMemo(() => {
    return months.map((monthName, index) => {
      const monthTxns = transactions.filter(t => t.date.getMonth() === index);
      const { earned, spent, saved } = calculateStats(monthTxns);

      return {
        name: monthName,
        Earned: earned,
        Spent: spent,
        Saved: saved
      };
    });
  }, [transactions, categories]);

  const totals = useMemo(() => calculateStats(transactions), [transactions, categories]);

  const topPayees = useMemo(() => {
    const grouped = transactions
      .filter(t => getCategoryType(t.category) === 'Expense')
      .reduce((acc: Record<string, number>, t) => {
        const flow = (t.type === 'Debit' ? t.amount : -t.amount);
        acc[t.payee] = (acc[t.payee] ?? 0) + flow;
        return acc;
      }, {});

    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .filter(p => p.name.toLowerCase().includes(payeeSearch.toLowerCase()))
      .sort((a, b) => (b.amount as number) - (a.amount as number));
  }, [transactions, payeeSearch, categories]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <TrendingDown size={140} />
        </div>
        <div className="relative z-10">
          <div className="mb-6">
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Fiscal Year {year} Summary</p>
            <h2 className="text-3xl font-black">Fiscal Flow Control</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-indigo-500/30 pt-6">
            <div>
              <p className="text-indigo-200 text-[10px] uppercase font-bold mb-1">Annual Earned</p>
              <p className="text-2xl font-black">₹{totals.earned.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-[10px] uppercase font-bold mb-1">Annual Spent</p>
              <p className="text-2xl font-black text-rose-300">₹{totals.spent.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-[10px] uppercase font-bold mb-1">Annual Savings</p>
              <p className="text-2xl font-black text-emerald-300">₹{totals.saved.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-8">Monthly Cashflow Performance</h3>
          <div className="h-[400px] w-full">
            <ReChartsResponsiveContainer width="100%" height="100%">
              <ReChartsBarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <ReChartsCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <ReChartsXAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <ReChartsYAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v: number) => `₹${v >= 1000 ? v/1000 + 'k' : v}`} />
                <ReChartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <ReChartsLegend verticalAlign="top" align="right" height={36} iconType="circle" />
                <ReChartsBar dataKey="Earned" fill="#10b981" radius={[4, 4, 0, 0]} />
                <ReChartsBar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <ReChartsBar dataKey="Saved" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </ReChartsBarChart>
            </ReChartsResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase">Top Payees ({year})</h3>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={payeeSearch}
                onChange={(e) => setPayeeSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-gray-50 border rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-indigo-500 w-32"
              />
            </div>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {topPayees.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 w-4">{idx + 1}.</span>
                    <p className="text-xs font-bold text-gray-700 truncate group-hover:text-indigo-600 transition-colors">{p.name}</p>
                  </div>
                  <div className="mt-1 bg-gray-100 h-1 rounded-full w-full">
                    <div 
                      className="bg-indigo-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(Math.abs(p.amount) / Math.max(1, Math.abs(topPayees[0]?.amount || 1))) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right pl-4">
                  <p className="text-xs font-black text-gray-900">₹{p.amount.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {((Math.abs(p.amount) / Math.max(1, totals.spent || 1)) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
            {topPayees.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-10 italic">No payees matching search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyView;
