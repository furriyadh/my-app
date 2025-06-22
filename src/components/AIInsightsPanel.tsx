import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Cpu,
  Bot,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Globe,
  Calendar,
  DollarSign
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'optimization' | 'prediction' | 'alert' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actionable: boolean;
  category: string;
  metrics?: {
    current: number;
    predicted: number;
    change: number;
  };
}

interface AIInsightsPanelProps {
  campaigns: any[];
  summary: any;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ campaigns, summary }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [aiThinking, setAiThinking] = useState(true);

  // Generate AI insights based on campaign data
  const generateAIInsights = () => {
    const generatedInsights: AIInsight[] = [
      {
        id: 'opt_001',
        type: 'optimization',
        priority: 'high',
        title: 'Budget Reallocation Opportunity',
        description: 'AI detected 23% performance improvement potential by reallocating budget from low-performing campaigns to high-conversion campaigns.',
        impact: '+$2,340 estimated monthly revenue',
        confidence: 94,
        actionable: true,
        category: 'Budget Optimization',
        metrics: {
          current: summary?.totalSpend || 0,
          predicted: (summary?.totalSpend || 0) * 1.23,
          change: 23
        }
      },
      {
        id: 'pred_001',
        type: 'prediction',
        priority: 'medium',
        title: 'Seasonal Performance Forecast',
        description: 'Machine learning models predict 35% increase in conversion rates during the next 2 weeks based on historical patterns and market trends.',
        impact: '+35% conversion rate',
        confidence: 87,
        actionable: true,
        category: 'Performance Prediction',
        metrics: {
          current: summary?.conversionRate || 0,
          predicted: (summary?.conversionRate || 0) * 1.35,
          change: 35
        }
      },
      {
        id: 'alert_001',
        type: 'alert',
        priority: 'high',
        title: 'Competitor Activity Detected',
        description: 'AI monitoring detected increased competitor bidding activity in your top keywords. Immediate action recommended to maintain position.',
        impact: 'Potential 15% impression loss',
        confidence: 91,
        actionable: true,
        category: 'Competitive Intelligence'
      },
      {
        id: 'rec_001',
        type: 'recommendation',
        priority: 'medium',
        title: 'Audience Expansion Opportunity',
        description: 'Neural network analysis identified 3 high-value audience segments with 78% similarity to your best-performing customers.',
        impact: '+28% reach expansion',
        confidence: 82,
        actionable: true,
        category: 'Audience Optimization'
      },
      {
        id: 'opt_002',
        type: 'optimization',
        priority: 'low',
        title: 'Ad Schedule Optimization',
        description: 'Time-based performance analysis suggests adjusting ad schedules to focus on high-conversion hours (2-4 PM, 7-9 PM).',
        impact: '+12% efficiency gain',
        confidence: 76,
        actionable: true,
        category: 'Schedule Optimization'
      },
      {
        id: 'pred_002',
        type: 'prediction',
        priority: 'high',
        title: 'Quality Score Improvement Forecast',
        description: 'AI predicts implementing suggested keyword and ad copy changes will improve Quality Score by 2.3 points within 30 days.',
        impact: '+2.3 Quality Score points',
        confidence: 89,
        actionable: true,
        category: 'Quality Optimization',
        metrics: {
          current: summary?.qualityScore || 0,
          predicted: (summary?.qualityScore || 0) + 2.3,
          change: 2.3
        }
      }
    ];

    return generatedInsights;
  };

  useEffect(() => {
    // Simulate AI analysis
    setIsAnalyzing(true);
    setAiThinking(true);

    const analysisTimer = setTimeout(() => {
      setInsights(generateAIInsights());
      setIsAnalyzing(false);
      
      setTimeout(() => {
        setAiThinking(false);
      }, 1000);
    }, 3000);

    return () => clearTimeout(analysisTimer);
  }, [campaigns, summary]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-orange-500';
      case 'medium': return 'from-yellow-500 to-amber-500';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return Target;
      case 'prediction': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      default: return Brain;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-yellow-400';
    if (confidence >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 30px rgba(147, 51, 234, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Intelligence Center
            </h2>
            <p className="text-gray-600 font-medium">
              Advanced machine learning insights and predictions
            </p>
          </div>
          
          {/* AI Status Indicator */}
          <div className="ml-auto flex items-center gap-3">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-green-700">AI Active</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Thinking Animation */}
      <AnimatePresence>
        {aiThinking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/50"
          >
            <div className="flex items-center justify-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Cpu className="w-6 h-6 text-blue-500" />
              </motion.div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">AI is analyzing your data</span>
                <motion.div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8">
        {isAnalyzing ? (
          // Loading State
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : (
          // Insights Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => {
              const IconComponent = getTypeIcon(insight.type);
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedInsight(insight)}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Priority Indicator */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getPriorityColor(insight.priority)} rounded-t-2xl`} />
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${getPriorityColor(insight.priority)}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {insight.title}
                        </h3>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Confidence Score */}
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}%
                      </div>
                      <div className="text-xs text-gray-500">confidence</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {insight.description}
                  </p>

                  {/* Impact & Metrics */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {insight.impact}
                      </span>
                    </div>
                    
                    {insight.metrics && (
                      <div className="flex items-center gap-1">
                        {insight.metrics.change > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          insight.metrics.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {insight.actionable && (
                    <motion.button
                      className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply Recommendation
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* AI Summary Stats */}
        {!isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{insights.length}</div>
              <div className="text-sm text-blue-600">AI Insights</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.priority === 'high').length}
              </div>
              <div className="text-sm text-green-600">High Priority</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%
              </div>
              <div className="text-sm text-purple-600">Avg Confidence</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">
                {insights.filter(i => i.actionable).length}
              </div>
              <div className="text-sm text-orange-600">Actionable</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedInsight.title}
                </h3>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-600">{selectedInsight.description}</p>
                
                {selectedInsight.metrics && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedInsight.metrics.current.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {selectedInsight.metrics.predicted.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Predicted</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        selectedInsight.metrics.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedInsight.metrics.change > 0 ? '+' : ''}{selectedInsight.metrics.change}%
                      </div>
                      <div className="text-sm text-gray-600">Change</div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow">
                    Apply Recommendation
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightsPanel;

