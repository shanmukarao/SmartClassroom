import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'brand', trend }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const iconBgMap = {
    brand: 'bg-brand-500 text-white',
    teal: 'bg-teal-600 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-500 text-white',
    indigo: 'bg-indigo-600 text-white',
  };

  return (
    <div className={`p-5 rounded-2xl border bg-white shadow-2xs hover:shadow-md transition-all flex items-start justify-between`}>
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {trend && (
          <span className="inline-block mt-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {trend}
          </span>
        )}
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${iconBgMap[color] || iconBgMap.brand}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
