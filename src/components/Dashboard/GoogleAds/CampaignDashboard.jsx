// components/Dashboard/GoogleAds/CampaignDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Eye,
  DollarSign,
  Calendar,
  Target,
  Play,
  Pause,
  Edit3,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import './CampaignDashboard.css';

const CampaignDashboard = ({ 
  campaigns = [], 
  onCampaignAction,
  onRefresh,
  isLoading = false 
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sample data for demonstration
  const sampleCampaigns = campaigns.length > 0 ? campaigns : [
    {
      id: 'camp_001',
      name: 'حملة ذكية - متجر إلكتروني',
      status: 'ACTIVE',
      budget: 500,
      spent: 342.50,
      impressions: 12500,
      clicks: 485,
      conversions: 23,
      ctr: 3.88,
      cpc: 0.71,
      conversionRate: 4.74,
      qualityScore: 8.5,
      startDate: '2024-01-15',
      endDate: '2024-02-15'
    },
    {
      id: 'camp_002', 
      name: 'حملة ذكية - خدمات استشارية',
      status: 'PAUSED',
      budget: 300,
      spent: 156.80,
      impressions: 8200,
      clicks: 298,
      conversions: 12,
      ctr: 3.63,
      cpc: 0.53,
      conversionRate: 4.03,
      qualityScore: 7.8,
      startDate: '2024-01-10',
      endDate: '2024-02-10'
    }
  ];

  // Performance data for charts
  const performanceData = [
    { date: '2024-01-15', impressions: 1200, clicks: 48, conversions: 3, cost: 34 },
    { date: '2024-01-16', impressions: 1450, clicks: 58, conversions: 4, cost: 41 },
    { date: '2024-01-17', impressions: 1680, clicks: 67, conversions: 5, cost: 47 },
    { date: '2024-01-18', impressions: 1890, clicks: 76, conversions: 6, cost: 54 },
    { date: '2024-01-19', impressions: 2100, clicks: 84, conversions: 7, cost: 59 },
    { date: '2024-01-20', impressions: 1950, clicks: 78, conversions: 5, cost: 55 },
    { date: '2024-01-21', impressions: 2250, clicks: 90, conversions: 8, cost: 64 }
  ];

  const deviceData = [
    { name: 'الجوال', value: 65, color: '#3b82f6' },
    { name: 'سطح المكتب', value: 25, color: '#10b981' },
    { name: 'الجهاز اللوحي', value: 10, color: '#f59e0b' }
  ];

  // Handle campaign selection
  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
  };

  // Handle campaign actions
  const handleCampaignAction = (action, campaignId) => {
    onCampaignAction?.(action, campaignId);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">نشطة</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">متوقفة</Badge>;
      case 'ENDED':
        return <Badge variant="secondary">منتهية</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  // Calculate performance metrics
  const calculateMetrics = (campaign) => {
    const roi = campaign.conversions > 0 ? ((campaign.conversions * 50 - campaign.spent) / campaign.spent * 100) : 0;
    const budgetUsed = (campaign.spent / campaign.budget * 100);
    
    return {
      roi: roi.toFixed(1),
      budgetUsed: budgetUsed.toFixed(1)
    };
  };

  return (
    <div className="campaign-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              لوحة تحكم الحملات
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mt-2"
            >
              مراقبة وإدارة حملاتك الإعلانية الذكية
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              تحديث
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </Button>
          </motion.div>
        </div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'إجمالي الحملات',
              value: sampleCampaigns.length,
              icon: BarChart3,
              color: 'blue',
              change: '+2 هذا الشهر'
            },
            {
              title: 'إجمالي الإنفاق',
              value: `$${sampleCampaigns.reduce((sum, c) => sum + c.spent, 0).toFixed(2)}`,
              icon: DollarSign,
              color: 'green',
              change: '+12% من الشهر الماضي'
            },
            {
              title: 'إجمالي النقرات',
              value: sampleCampaigns.reduce((sum, c) => sum + c.clicks, 0).toLocaleString(),
              icon: MousePointer,
              color: 'purple',
              change: '+8% من الأسبوع الماضي'
            },
            {
              title: 'إجمالي التحويلات',
              value: sampleCampaigns.reduce((sum, c) => sum + c.conversions, 0),
              icon: Target,
              color: 'orange',
              change: '+15% من الأسبوع الماضي'
            }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-green-600 mt-1">{metric.change}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${metric.color}-100`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaigns List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  الحملات النشطة
                </CardTitle>
                <CardDescription>
                  قائمة بجميع حملاتك الإعلانية وأداؤها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleCampaigns.map((campaign, index) => {
                    const metrics = calculateMetrics(campaign);
                    
                    return (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md ${
                          selectedCampaign?.id === campaign.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleCampaignSelect(campaign)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCampaignAction('edit', campaign.id);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={campaign.status === 'ACTIVE' ? 'outline' : 'default'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCampaignAction(
                                  campaign.status === 'ACTIVE' ? 'pause' : 'resume', 
                                  campaign.id
                                );
                              }}
                            >
                              {campaign.status === 'ACTIVE' ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">الميزانية:</span>
                            <div className="font-medium">${campaign.budget}</div>
                            <Progress value={parseFloat(metrics.budgetUsed)} className="h-1 mt-1" />
                          </div>
                          <div>
                            <span className="text-muted-foreground">النقرات:</span>
                            <div className="font-medium">{campaign.clicks.toLocaleString()}</div>
                            <div className="text-xs text-green-600">CTR: {campaign.ctr}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">التحويلات:</span>
                            <div className="font-medium">{campaign.conversions}</div>
                            <div className="text-xs text-blue-600">معدل: {campaign.conversionRate}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">نقاط الجودة:</span>
                            <div className="font-medium">{campaign.qualityScore}/10</div>
                            <div className="text-xs text-purple-600">ممتاز</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Charts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اتجاه الأداء</CardTitle>
                <CardDescription>آخر 7 أيام</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع الأجهزة</CardTitle>
                <CardDescription>نسبة النقرات حسب الجهاز</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {deviceData.map((device, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: device.color }}
                        />
                        <span>{device.name}</span>
                      </div>
                      <span className="font-medium">{device.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Zap className="w-4 h-4" />
                  إنشاء حملة جديدة
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <BarChart3 className="w-4 h-4" />
                  عرض التقارير التفصيلية
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Share2 className="w-4 h-4" />
                  مشاركة النتائج
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Campaign View */}
        <AnimatePresence>
          {selectedCampaign && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>تفاصيل الحملة: {selectedCampaign.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCampaign(null)}
                    >
                      إغلاق
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="performance" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="performance">الأداء</TabsTrigger>
                      <TabsTrigger value="keywords">الكلمات المفتاحية</TabsTrigger>
                      <TabsTrigger value="ads">الإعلانات</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="performance" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-4">اتجاه الأداء</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                              <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-4">مقاييس الأداء</h4>
                          <div className="space-y-4">
                            {[
                              { label: 'معدل النقر (CTR)', value: `${selectedCampaign.ctr}%`, color: 'blue' },
                              { label: 'تكلفة النقرة (CPC)', value: `$${selectedCampaign.cpc}`, color: 'green' },
                              { label: 'معدل التحويل', value: `${selectedCampaign.conversionRate}%`, color: 'purple' },
                              { label: 'نقاط الجودة', value: `${selectedCampaign.qualityScore}/10`, color: 'orange' }
                            ].map((metric, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">{metric.label}</span>
                                <span className={`text-lg font-bold text-${metric.color}-600`}>
                                  {metric.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="keywords" className="mt-6">
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">قريباً</h3>
                        <p className="text-muted-foreground">
                          سيتم إضافة تفاصيل الكلمات المفتاحية قريباً
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="ads" className="mt-6">
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">قريباً</h3>
                        <p className="text-muted-foreground">
                          سيتم إضافة تفاصيل الإعلانات قريباً
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CampaignDashboard;
