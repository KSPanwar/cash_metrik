
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Transaction, Category } from '../types';

interface CategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions, categories }) => {
  const getCategoryType = (catId: string | undefined) => {
    return categories.find(c => c.id === catId)?.type || 'Expense';
  };

  const categoryData = transactions
    .filter(t => {
      const type = getCategoryType(t.category);
      return type === 'Expense' || type === 'Savings';
    })
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || 'Other';
      const currentAmount = acc[cat] ?? 0;
      // Subtract credits (refunds) from expense total
      const flow = (t.type === 'Debit' ? t.amount : -t.amount);
      acc[cat] = currentAmount + flow;
      return acc;
    }, {});

  const data = Object.entries(categoryData)
    // Fix: Cast 'value' to number as Object.entries can sometimes infer values as unknown in certain TS configurations
    .map(([name, value]) => ({ name, value: Math.max(0, value as number) }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const catId = payload[0].name;
              const type = getCategoryType(String(catId));
              return (
                <div className="bg-white p-3 border rounded-xl shadow-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{catId} ({type})</p>
                  <p className="text-sm font-bold text-indigo-600">₹{payload[0].value?.toLocaleString('en-IN')}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          verticalAlign="middle" 
          align="right" 
          layout="vertical"
          iconType="circle"
          wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingLeft: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
