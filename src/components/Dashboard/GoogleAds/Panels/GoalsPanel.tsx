"use client";

import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Edit2, Trash2, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface Goal {
  id: string;
  metric: string;
  target: number;
  current: number;
  status: 'achieved' | 'on-track' | 'at-risk' | 'missed';
}

interface GoalsPanelProps {
  metrics: any;
}

const GoalsPanel: React.FC<GoalsPanelProps> = ({ metrics }) => {
  const { t, isRTL } = useTranslation();
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', metric: 'ROAS', target: 4.0, current: metrics.roas || 0, status: 'on-track' },
    { id: '2', metric: 'CTR', target: 5.0, current: metrics.ctr || 0, status: 'at-risk' },
    { id: '3', metric: 'Conversions', target: 500, current: metrics.conversions || 0, status: 'achieved' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'on-track': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'at-risk': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'missed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved': return <CheckCircle2 className="w-4 h-4" />;
      case 'on-track': return <TrendingUp className="w-4 h-4" />;
      case 'at-risk': return <AlertCircle className="w-4 h-4" />;
      case 'missed': return <TrendingDown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="backdrop-blur-sm rounded-[20px] p-5 border border-solid" style={{ backgroundColor: '#060010', borderColor: '#392e4e' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          {isRTL ? 'الأهداف والغايات' : 'Goals & Targets'}
        </h3>
        <button className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors">
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.current, goal.target);
          
          return (
            <div
              key={goal.id}
              className="p-4 bg-purple-900/10 border border-purple-900/20 rounded-lg hover:bg-purple-900/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{goal.metric}</span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(goal.status)}`}>
                    {getStatusIcon(goal.status)}
                    {goal.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-purple-900/30 rounded transition-colors">
                    <Edit2 className="w-3 h-3 text-gray-400 hover:text-white" />
                  </button>
                  <button className="p-1 hover:bg-red-500/20 rounded transition-colors">
                    <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">{isRTL ? 'الحالي' : 'Current'}: <span className="text-white font-semibold">{goal.current.toFixed(2)}</span></span>
                <span className="text-gray-400">{isRTL ? 'الهدف' : 'Target'}: <span className="text-purple-400 font-semibold">{goal.target.toFixed(2)}</span></span>
              </div>

              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                    progress >= 100 ? 'bg-green-500' :
                    progress >= 75 ? 'bg-blue-500' :
                    progress >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-400 mt-1">{progress.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsPanel;

