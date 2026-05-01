'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, Cell, Legend, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface FraudStatsProps {
  data: any;
}

export const FraudStatsChart = ({ data }: FraudStatsProps) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  if (!data || !data.labels || !data.data) {
    return (
      <div className="card h-[500px] flex items-center justify-center">
        <span className="spinner" style={{ width: '30px', height: '30px', borderTopColor: '#00ffb4' }}></span>
      </div>
    );
  }

  const chartData = [
    {
      name: data.labels[0],
      value: data.data[0],
      percentage: Number(data.percentages[0].toFixed(2)),
      fill: '#00ffb4'
    },
    {
      name: data.labels[1],
      value: data.data[1],
      percentage: Number(data.percentages[1].toFixed(2)),
      fill: '#ff6b6b'
    }
  ];

  const COLORS = ['#00ffb4', '#ff6b6b'];

  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#08121c] border border-[rgba(0,255,180,0.3)] rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold text-[#e0fff8]">{data.name}</p>
          <p className="text-sm text-[#00ffb4]">Count: {data.value}</p>
          <p className="text-sm text-[#00b4ff]">{data.percentage.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[rgba(0,255,180,0.15)] flex items-center justify-between bg-[#08121c]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[rgba(0,180,255,0.1)] rounded-lg border border-[rgba(0,180,255,0.2)]">
            <TrendingUp className="w-5 h-5 text-[#00b4ff]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e0fff8] font-['Orbitron',monospace] tracking-wider">Fraud Detection Statistics</h3>
            <p className="text-[9px] text-[#00ffb4]/70 font-bold uppercase tracking-widest mt-0.5">Dataset Analysis • {data.total} Total Records</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded font-medium transition-all text-sm ${
              chartType === 'pie'
                ? 'bg-[#00ffb4] text-[#08121c]'
                : 'bg-[rgba(0,255,180,0.1)] border border-[rgba(0,255,180,0.2)] text-[#00ffb4]'
            }`}
          >
            Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded font-medium transition-all text-sm ${
              chartType === 'bar'
                ? 'bg-[#00ffb4] text-[#08121c]'
                : 'bg-[rgba(0,255,180,0.1)] border border-[rgba(0,255,180,0.2)] text-[#00ffb4]'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        {chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  color: '#00ffb4'
                }}
                formatter={(value) => <span style={{ color: '#00ffb4' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,180,0.1)" />
              <XAxis
                dataKey="name"
                stroke="#00ffb4"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <YAxis stroke="#00ffb4" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#00ffb4" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 border-t border-[rgba(0,255,180,0.15)]">
        <div className="bg-[rgba(0,255,180,0.05)] border border-[rgba(0,255,180,0.2)] rounded-lg p-4">
          <p className="text-xs text-[#00ffb4]/70 uppercase font-bold tracking-widest mb-2">Legitimate Records</p>
          <p className="text-2xl font-bold text-[#00ffb4] font-['Orbitron',monospace]">{data.data[0].toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">{(data.percentages[0]).toFixed(2)}% of dataset</p>
        </div>
        <div className="bg-[rgba(255,107,107,0.05)] border border-[rgba(255,107,107,0.2)] rounded-lg p-4">
          <p className="text-xs text-red-400 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
            <AlertCircle className="w-3 h-3" /> Fraudulent Records
          </p>
          <p className="text-2xl font-bold text-red-400 font-['Orbitron',monospace]">{data.data[1].toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">{(data.percentages[1]).toFixed(2)}% of dataset</p>
        </div>
      </div>
    </div>
  );
};
