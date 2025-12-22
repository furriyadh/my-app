"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  Target,
  DollarSign,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  X,
  Info
} from 'lucide-react';

interface Insight {
  id: number;
  type: 'opportunity' | 'warning' | 'success' | 'insight';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  recommendation: string;
  metrics: any;
  actionable: boolean;
  action?: any;
}

interface AIInsightsPanelProps {
  customerId?: string;
  onApplyAction?: (action: any) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  Target,
  DollarSign,
  Users,
  Award
};

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ customerId, onApplyAction }) => {
  const { t, isRTL } = useTranslation();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [customerId]);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/campaigns/insights?customerId=${customerId || ''}`);
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeStyles = (type: string) => {
    const styles = {
      opportunity: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      success: 'bg-green-500/10 border-green-500/30 text-green-400',
      insight: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
    };
    return styles[type as keyof typeof styles] || styles.insight;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[priority as keyof typeof styles]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const displayedInsights = showAll ? insights : insights.slice(0, 3);

  if (isLoading) {
    return (
      <div className="backdrop-blur-sm p-5 border border-solid transition-all duration-300 ease-in-out hover:-translate-y-0.5" style={{ backgroundColor: '#060010', borderColor: '#392e4e', borderRadius: '20px', fontWeight: 300 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {(t.dashboard as any)?.aiInsights || '🤖 AI Insights'}
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse" style={{ backgroundColor: 'rgba(57, 46, 78, 0.3)', borderRadius: '16px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-sm p-5 border border-solid shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(46,24,78,0.4)]" style={{ backgroundColor: '#060010', borderColor: '#392e4e', borderRadius: '20px', fontWeight: 300 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {(t.dashboard as any)?.aiInsights || '🤖 AI Insights'}
            </h2>
            <p className="text-sm text-white/60">
              {(t.dashboard as any)?.aiInsightsDesc || 'Smart recommendations powered by AI'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => fetchInsights()}
          className="p-2 hover:bg-[#392e4e]/30 rounded-lg transition-colors group"
          title="Refresh insights"
        >
          <Sparkles className="w-5 h-5 text-white/60 group-hover:text-purple-400 transition-colors" />
        </button>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {displayedInsights.map((insight) => {
          const IconComponent = iconMap[insight.icon] || Info;
          const typeStyles = getTypeStyles(insight.type);
          
          return (
            <div
              key={insight.id}
              className={`group relative p-4 border ${typeStyles} hover:bg-[#392e4e]/20 transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-0.5`}
              style={{ borderRadius: '16px' }}
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${typeStyles}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {insight.title}
                    </h3>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  
                  <p className="text-xs text-white/60 mb-2 line-clamp-2">
                    {insight.description}
                  </p>
                  
                  {insight.actionable && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">
                        💡 {insight.recommendation}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {insights.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          {showAll 
            ? `${(t.dashboard as any)?.showLess || 'Show Less'} ↑`
            : `${(t.dashboard as any)?.showMore || `Show ${insights.length - 3} More`} ↓`
          }
        </button>
      )}

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInsight(null)}
        >
          <div 
            className="p-6 max-w-lg w-full border border-solid shadow-2xl" style={{ backgroundColor: '#060010', borderColor: '#392e4e', borderRadius: '20px', fontWeight: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {(() => {
                  const IconComponent = iconMap[selectedInsight.icon] || Info;
                  return (
                    <div className={`p-3 rounded-xl ${getTypeStyles(selectedInsight.type)}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {selectedInsight.title}
                  </h3>
                  {getPriorityBadge(selectedInsight.priority)}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedInsight(null)}
                className="p-2 hover:bg-[#392e4e]/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">Description</h4>
                <p className="text-sm text-white/60">{selectedInsight.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">Recommendation</h4>
                <p className="text-sm text-white/60">{selectedInsight.recommendation}</p>
              </div>
              
              {selectedInsight.metrics && (
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-2">Metrics</h4>
                  <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: 'rgba(57, 46, 78, 0.3)' }}>
                    {Object.entries(selectedInsight.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-xs text-white/50 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium text-white/90">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedInsight.actionable && (
                <button
                  onClick={() => {
                    onApplyAction?.(selectedInsight.action);
                    setSelectedInsight(null);
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Apply Recommendation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;

