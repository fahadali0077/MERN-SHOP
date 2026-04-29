"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, type TooltipProps,
} from "recharts";
import { REVENUE_DATA } from "@/lib/mock/adminData";

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-lg dark:border-dark-border dark:bg-dark-surface">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="text-sm font-semibold text-ink dark:text-white">
          {e.name === "revenue" ? `$${(e.value ?? 0).toLocaleString()}` : `${e.value ?? 0} orders`}
        </p>
      ))}
    </div>
  );
}

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-border bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-normal dark:text-white">Revenue</h2>
          <p className="text-sm text-ink-muted">Last 30 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-amber opacity-80"/>Revenue</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-blue-400 opacity-80"/>Orders</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={REVENUE_DATA} margin={{ top:5, right:5, left:0, bottom:5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#d97706" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d97706" stopOpacity={0.02}/>
            </linearGradient>
            <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2dbd2" strokeOpacity={0.5}/>
          <XAxis dataKey="date" tick={{fontSize:11,fill:"#8a7f74"}} axisLine={false} tickLine={false} interval={2}/>
          <YAxis tick={{fontSize:11,fill:"#8a7f74"}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>`$${(v/1000).toFixed(0)}k`} width={40}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{r:4,fill:"#d97706",strokeWidth:0}}/>
          <Area type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} fill="url(#ordersGrad)" dot={false} activeDot={{r:4,fill:"#60a5fa",strokeWidth:0}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
