
import React, { useState } from 'react';
import { 
  BookOpen, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  FileSearch, 
  CalendarDays, 
  LineChart, 
  Lock, 
  Github, 
  Mail, 
  Send 
} from 'lucide-react';

// --- HOW TO USE ---
export const HowToUse: React.FC = () => {
  const steps = [
    {
      title: "1. Secure Import",
      desc: "Upload your PNB, HDFC, or SBI Excel statements. Your data never leaves your browser; it's processed locally for 100% privacy.",
      icon: <FileSearch className="text-indigo-600" size={24} />
    },
    {
      title: "2. Manual Entries",
      desc: "Missed a cash transaction? Simply click on any date in the Calendar View to manually log expenses or income.",
      icon: <CalendarDays className="text-emerald-600" size={24} />
    },
    {
      title: "3. Smart Categorization",
      desc: "Tag your transactions (e.g., 'Food', 'Rent'). Use the 'Payee Groups' tab to categorize all historical transactions from a specific merchant at once.",
      icon: <BookOpen className="text-amber-600" size={24} />
    },
    {
      title: "4. Global Persistence",
      desc: "CashMertik 'learns' your mappings. Once you tag a payee, the app remembers it for future imports. Export your rules to keep them safe.",
      icon: <Lock className="text-purple-600" size={24} />
    },
    {
      title: "5. Financial Analytics",
      desc: "Switch to 'Analytics' to see yearly trends, top payees, and sector allocations. Track your 'Asset Savings' over time.",
      icon: <LineChart className="text-rose-600" size={24} />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mastering CashMertik</h2>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">A quick guide to navigating your local financial headquarters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              {step.icon}
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ABOUT ME ---
export const AboutMe: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-6">
          <User size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">The Vision Behind CashMertik</h2>
        <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-[0.3em]">Privacy • Simplicity • Control</p>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-6">
        <p className="text-lg font-medium text-gray-700 leading-relaxed text-center italic">
          "I built CashMertik because I was tired of sharing my most sensitive banking data with companies just to see a simple pie chart."
        </p>
        <div className="h-px bg-gray-100 w-24 mx-auto" />
        <div className="space-y-4 text-gray-600 font-medium">
          <p>
            CashMertik is a **client-side-only** application. This means every line of your transaction history is processed and stored strictly within your browser's local database. No servers, no tracking, and no hidden data sales.
          </p>
          <p>
            My goal was to merge professional-grade visualization with absolute privacy. Whether you're tracking small daily spends or long-term asset growth, CashMertik gives you the clarity you need to reach financial clarity.
          </p>
        </div>
        <div className="pt-6 flex justify-center gap-4">
           <a href="mailto:support@cashmertik.local" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
             <Mail size={16} /> Contact Me
           </a>
        </div>
      </div>
    </div>
  );
};

// --- FEEDBACK ---
export const Feedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Feedback',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    console.log('Feedback submitted:', formData);
    setSubmitted(true);
    
    // Integration Tip: You can use services like Formspree, Netlify Forms, or a custom API here.
    // Example: fetch('/api/feedback', { method: 'POST', body: JSON.stringify(formData) })
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Message Received!</h2>
        <p className="text-gray-500 font-medium">Thank you for helping us build a better CashMertik. I'll review your feedback and get back to you if necessary.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Shape the Future</h2>
        <p className="text-sm text-gray-500">Found a bug or have a feature request? Let me know below.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name (Optional)</label>
            <input 
              type="text" 
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white px-5 py-4 rounded-2xl outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Required)</label>
            <input 
              type="email" 
              required
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white px-5 py-4 rounded-2xl outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Submission Type</label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white px-5 py-4 rounded-2xl outline-none transition-all text-sm font-bold text-gray-700"
          >
            <option>Bug Report</option>
            <option>Feature Request</option>
            <option>General Feedback</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
          <textarea 
            required
            rows={5}
            placeholder="Tell us what's on your mind..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white px-5 py-4 rounded-2xl outline-none transition-all text-sm font-medium resize-none"
          />
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Send size={16} /> Send Message
        </button>
      </form>
    </div>
  );
};
