
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types';

interface CalendarViewProps {
  transactions: Transaction[];
  month: number;
  year: number;
  categories: Category[];
  onAddTransaction: (txn: Omit<Transaction, 'id'>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ transactions, month, year, categories, onAddTransaction }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const todayDate = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const getDailyStats = (day: number) => {
    const dailyTxns = transactions.filter(t => t.date.getDate() === day);
    
    const debit = dailyTxns
      .reduce((s, t) => {
        const cat = categories.find(c => c.id === t.category);
        const type = cat?.type || 'Expense';
        
        // Sum spending only for Expense and Savings categories, respecting refunds
        if (type === 'Expense' || type === 'Savings') {
            return s + (t.type === 'Debit' ? t.amount : -t.amount);
        }
        return s;
      }, 0);
      
    return { debit: Math.max(0, debit), count: dailyTxns.length, txns: dailyTxns };
  };

  const isFutureDay = (day: number) => {
    if (year > currentYear) return true;
    if (year === currentYear && month > currentMonth) return true;
    if (year === currentYear && month === currentMonth && day > todayDate) return true;
    return false;
  };

  const handleDayClick = (day: number) => {
    if (isFutureDay(day)) return;
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-gray-50 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-gray-50 h-24 sm:h-32" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { debit, count } = getDailyStats(day);
          const future = isFutureDay(day);
          
          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)} 
              className={`h-24 sm:h-32 p-2 transition-all group relative ${
                future 
                  ? 'bg-slate-50/50 cursor-not-allowed opacity-40' 
                  : 'bg-white hover:bg-indigo-50/50 cursor-pointer'
              }`}
            >
              <span className={`text-xs font-medium ${future ? 'text-gray-300' : 'text-gray-500 group-hover:text-indigo-600'}`}>
                {day}
              </span>
              {debit > 0 && (
                <div className="mt-2 text-right">
                  <div className="text-[10px] font-bold text-red-500">-₹{debit.toLocaleString('en-IN')}</div>
                  <div className="text-[8px] text-gray-400">{count} txns</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedDay && (
        <DayModal 
          day={selectedDay}
          month={month}
          year={year}
          categories={categories}
          stats={getDailyStats(selectedDay)}
          onClose={() => setIsModalOpen(false)}
          onAdd={onAddTransaction}
        />
      )}
    </div>
  );
};

const DayModal = ({ day, month, year, stats, categories, onClose, onAdd }: any) => {
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [type, setType] = useState<TransactionType>('Debit');
  const [category, setCategory] = useState('Other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !payee) return;
    onAdd({
      date: new Date(year, month, day),
      amount: parseFloat(amount),
      payee,
      type,
      category,
      remarks: `Manual: ${payee}`,
      bank: 'Manual'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{day} {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, month))}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="mb-6 space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase">Existing Records</h4>
            {stats.txns.map((t: Transaction) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-xs font-bold text-gray-800 truncate">{t.payee}</p>
                  <span className={`text-[9px] px-1 rounded font-bold ${t.category === 'Self' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {t.category || 'Other'}
                  </span>
                </div>
                <span className={`text-xs font-bold ${t.type === 'Debit' ? 'text-red-500' : 'text-green-500'}`}>₹{t.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">New Entry</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="Debit">Debit</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Amount</label>
                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Payee</label>
                <input type="text" placeholder="Where?" value={payee} onChange={(e) => setPayee(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                  {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.id} ({c.type})</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Save Record</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
