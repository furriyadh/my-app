"use client";

import { Brain, BarChart3, TrendingUp, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";

const aiPerformanceData = [
  { month: "Jan", manual: 45, ai: 48, cost: 120, conversions: 25 },
  { month: "Feb", manual: 47, ai: 58, cost: 115, conversions: 35 },
  { month: "Mar", manual: 48, ai: 72, cost: 105, conversions: 52 },
  { month: "Apr", manual: 50, ai: 89, cost: 90, conversions: 78 },
  { month: "May", manual: 51, ai: 115, cost: 75, conversions: 110 },
  { month: "Jun", manual: 52, ai: 145, cost: 60, conversions: 156 },
];

export default function ChartsSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full mb-8 shadow-lg shadow-green-500/20">
            <div className="relative">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-green-300 font-medium">Live Performance Data</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">See the </span>
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI Difference
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real results from businesses using our AI platform - updated in real-time
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: "+340%", label: "Avg. CTR Increase", color: "text-green-400", bg: "from-green-600/20" },
            { value: "-65%", label: "CPA Reduction", color: "text-blue-400", bg: "from-blue-600/20" },
            { value: "4.8x", label: "ROAS Improvement", color: "text-purple-400", bg: "from-purple-600/20" },
            { value: "24/7", label: "AI Optimization", color: "text-cyan-400", bg: "from-cyan-600/20" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${stat.bg} to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all`}
            >
              <p className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
          
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1 - AI vs Manual Performance */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Performance Comparison</h3>
                  <p className="text-gray-400 text-xs">AI vs Manual Management</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  <span className="text-xs text-gray-400">AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-gray-400">Manual</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={aiPerformanceData}>
                <defs>
                  <linearGradient id="colorAi2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorManual2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #8b5cf6',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)'
                  }} 
                />
                <Area type="monotone" dataKey="ai" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAi2)" />
                <Area type="monotone" dataKey="manual" stroke="#6b7280" strokeWidth={2} fillOpacity={1} fill="url(#colorManual2)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">+180% Better Performance with AI</span>
            </div>
          </div>

          {/* Chart 2 - Cost Reduction */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cost Optimization</h3>
                  <p className="text-gray-400 text-xs">CPA Reduction Over Time</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-green-400 text-sm font-bold">-50% CPA</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={aiPerformanceData}>
                <defs>
                  <linearGradient id="colorCost2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #22c55e',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-2xl font-bold text-red-400">$120</p>
                <p className="text-xs text-gray-400 mt-1">Starting CPA</p>
              </div>
              <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-2xl font-bold text-green-400">$60</p>
                <p className="text-xs text-gray-400 mt-1">Current CPA</p>
              </div>
              <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <p className="text-2xl font-bold text-green-400">50%</p>
                <p className="text-xs text-gray-400 mt-1">Savings</p>
              </div>
            </div>
          </div>
        </div>
          
        {/* Bottom Insight */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">AI Optimization Running</h3>
                <p className="text-gray-400">Our AI has made <span className="text-green-400 font-semibold">2,847 optimizations</span> in the last 24 hours</p>
              </div>
            </div>
            <Link
              href="/authentication/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Get These Results
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

