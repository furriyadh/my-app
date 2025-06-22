import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  TimeScale,
  ChartOptions,
  TooltipItem,
  ChartData
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Globe,
  Clock,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Calendar,
  Zap,
  Eye,
  MousePointer,
  DollarSign
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  TimeScale
);

interface AdvancedChartsProps {
  campaigns: any[];
  summary: any;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ campaigns, summary }) => {
  const [activeChart, setActiveChart] = useState('performance');
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Performance Trend Chart Data
  const performanceData: ChartData<'line'> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Impressions',
        data: [45000, 52000, 48000, 61000, 58000, 67000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Clicks',
        data: [1200, 1450, 1380, 1620, 1580, 1750],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Conversions',
        data: [85, 98, 92, 115, 108, 125],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // Campaign Performance Comparison
  const campaignComparisonData: ChartData<'bar'> = {
    labels: campaigns.map(c => c.name.substring(0, 20) + '...'),
    datasets: [
      {
        label: 'Cost per Conversion',
        data: campaigns.map(c => c.costPerConversion || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(147, 51, 234)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Device Performance Doughnut
  const deviceData: ChartData<'doughnut'> = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [45, 40, 15],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(147, 51, 234)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 3,
        hoverOffset: 10,
      }
    ]
  };

  // Campaign Quality Radar
  const qualityRadarData: ChartData<'radar'> = {
    labels: ['Quality Score', 'CTR', 'Conversion Rate', 'Impression Share', 'Ad Relevance', 'Landing Page'],
    datasets: campaigns.slice(0, 3).map((campaign, index) => ({
      label: campaign.name.substring(0, 15) + '...',
      data: [
        campaign.qualityScore || 8,
        (campaign.ctr || 2) * 2,
        (campaign.conversionRate || 5) * 2,
        (campaign.impressionShare || 80) / 10,
        8 + Math.random() * 2,
        7 + Math.random() * 3
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.2)',
        'rgba(147, 51, 234, 0.2)',
        'rgba(16, 185, 129, 0.2)',
      ][index],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(147, 51, 234)',
        'rgb(16, 185, 129)',
      ][index],
      borderWidth: 2,
      pointBackgroundColor: [
        'rgb(59, 130, 246)',
        'rgb(147, 51, 234)',
        'rgb(16, 185, 129)',
      ][index],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: [
        'rgb(59, 130, 246)',
        'rgb(147, 51, 234)',
        'rgb(16, 185, 129)',
      ][index],
    }))
  };

  // Hourly Performance Heatmap Data (simulated as scatter)
  const hourlyData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Performance by Hour',
        data: Array.from({ length: 24 }, (_, hour) => ({
          x: hour,
          y: Math.random() * 100 + 20,
        })),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      }
    ]
  };

  // Chart Options with proper typing - Fixed all TypeScript errors
  const commonOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' // Fixed: changed from 500 to 'normal'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          // Removed drawBorder as it doesn't exist in Chart.js v4
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          // Removed drawBorder as it doesn't exist in Chart.js v4
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: isAnimating ? 2000 : 0,
      easing: 'easeInOutQuart',
    }
  };

  const radarOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' // Fixed: changed from 500 to 'normal'
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        ticks: {
          color: '#6B7280',
          backdropColor: 'transparent',
          font: {
            size: 10
          }
        }
      }
    },
    animation: {
      duration: isAnimating ? 2000 : 0,
      easing: 'easeInOutQuart',
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' // Fixed: changed from 500 to 'normal'
          }
        }
      }
    },
    animation: {
      duration: isAnimating ? 2000 : 0,
      easing: 'easeInOutQuart',
    }
  };

  const scatterOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' // Fixed: changed from 500 to 'normal'
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Hour of Day',
          color: '#6B7280'
        },
        min: 0,
        max: 23,
        ticks: {
          stepSize: 2,
          color: '#6B7280'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Performance Score',
          color: '#6B7280'
        },
        ticks: {
          color: '#6B7280'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    },
    animation: {
      duration: isAnimating ? 2000 : 0,
      easing: 'easeInOutQuart',
    }
  };

  const charts = [
    {
      id: 'performance',
      title: 'Performance Trends',
      icon: TrendingUp,
      description: 'Track key metrics over time',
      component: <Line data={performanceData} options={commonOptions} />
    },
    {
      id: 'campaigns',
      title: 'Campaign Comparison',
      icon: BarChart3,
      description: 'Compare cost per conversion',
      component: <Bar data={campaignComparisonData} options={commonOptions} />
    },
    {
      id: 'devices',
      title: 'Device Performance',
      icon: Smartphone,
      description: 'Traffic distribution by device',
      component: <Doughnut data={deviceData} options={doughnutOptions} />
    },
    {
      id: 'quality',
      title: 'Quality Analysis',
      icon: Target,
      description: 'Multi-dimensional quality comparison',
      component: <Radar data={qualityRadarData} options={radarOptions} />
    },
    {
      id: 'hourly',
      title: 'Hourly Performance',
      icon: Clock,
      description: 'Performance heatmap by hour',
      component: <Scatter data={hourlyData} options={scatterOptions} />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Chart Navigation */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex items-center gap-4 mb-6">
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
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Analytics
            </h2>
            <p className="text-gray-600 font-medium">
              Interactive charts and performance insights
            </p>
          </div>
        </div>

        {/* Chart Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {charts.map((chart) => {
            const IconComponent = chart.icon;
            return (
              <motion.button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeChart === chart.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-5 h-5" />
                <span>{chart.title}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Chart */}
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {charts.find(c => c.id === activeChart)?.title}
            </h3>
            <p className="text-gray-600">
              {charts.find(c => c.id === activeChart)?.description}
            </p>
          </div>
          
          <div className="h-96">
            {charts.find(c => c.id === activeChart)?.component}
          </div>
        </motion.div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Live CTR',
            value: '2.34%',
            change: '+0.12%',
            icon: MousePointer,
            color: 'from-blue-500 to-cyan-500',
            trend: 'up'
          },
          {
            title: 'Conversion Rate',
            value: '5.67%',
            change: '+0.45%',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
            trend: 'up'
          },
          {
            title: 'Cost per Click',
            value: '$1.23',
            change: '-$0.08',
            icon: DollarSign,
            color: 'from-orange-500 to-red-500',
            trend: 'down'
          },
          {
            title: 'Quality Score',
            value: '8.9',
            change: '+0.3',
            icon: Zap,
            color: 'from-purple-500 to-pink-500',
            trend: 'up'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  metric.trend === 'up' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {metric.change}
              </motion.div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </h3>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 mt-4">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs text-gray-500">Live data</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Geographic Performance Map Placeholder */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Geographic Performance</h2>
            <p className="text-gray-600">Campaign performance by location</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Locations */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Locations</h3>
            <div className="space-y-3">
              {[
                { country: 'Egypt', performance: 94, flag: '🇪🇬' },
                { country: 'Saudi Arabia', performance: 87, flag: '🇸🇦' },
                { country: 'UAE', performance: 82, flag: '🇦🇪' },
                { country: 'Kuwait', performance: 78, flag: '🇰🇼' },
                { country: 'Qatar', performance: 75, flag: '🇶🇦' }
              ].map((location, index) => (
                <motion.div
                  key={location.country}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{location.flag}</span>
                    <span className="font-medium text-gray-900">{location.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${location.performance}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {location.performance}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <div className="h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Interactive Map Coming Soon
                </h3>
                <p className="text-gray-500">
                  Real-time geographic performance visualization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;