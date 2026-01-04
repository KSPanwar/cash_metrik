
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Transaction, Category } from '../types';

interface ExpenseChartProps {
  transactions: Transaction[];
  categories: Category[];
  month: number;
  year: number;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions, categories, month, year }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const getCategoryType = (catId: string | undefined) => {
    return categories.find(c => c.id === catId)?.type || 'Expense';
  };

  const data = Array.from({ length: daysInMonth }).map((_, i) => {
    const day = i + 1;
    const dayTransactions = transactions.filter(t => t.date.getDate() === day);
    
    const spending = dayTransactions
      .filter(t => getCategoryType(t.category) === 'Expense')
      .reduce((sum, t) => sum + (t.type === 'Debit' ? t.amount : -t.amount), 0);
    
    return {
      day,
      spending: Math.max(0, spending) // Ensure we don't show negative spending dots
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          interval={2}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-3 border rounded-xl shadow-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date: {payload[0].payload.day} {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(year, month))}</p>
                  <p className="text-sm font-bold text-indigo-600">₹{payload[0].value?.toLocaleString('en-IN')}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area 
          type="monotone" 
          dataKey="spending" 
          stroke="#6366f1" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorSpend)" 
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
