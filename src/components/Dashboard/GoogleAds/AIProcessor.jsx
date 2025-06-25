// components/Dashboard/GoogleAds/AIProcessor.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  PenTool, 
  CheckCircle, 
  Loader2,
  Sparkles,
  Eye,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import './AIProcessor.css';

const AIProcessor = ({ 
  website, 
  onProcessingComplete, 
  onNext,
  isProcessing,
  processingSteps = []
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Default processing steps
  const defaultSteps = [
    {
      id: 'analyze',
      title: 'تحليل الموقع الإلكتروني',
      description: 'فحص محتوى الموقع وفهم النشاط التجاري',
      icon: Eye,
      duration: 3000,
      status: 'pending'
    },
    {
      id: 'keywords',
      title: 'استخراج الكلمات المفتاحية',
      description: 'تحديد أفضل الكلمات المفتاحية للاستهداف',
      icon: Target,
      duration: 2500,
      status: 'pending'
    },
    {
      id: 'audience',
      title: 'تحليل الجمهور المستهدف',
      description: 'تحديد خصائص العملاء المحتملين',
      icon: TrendingUp,
      duration: 2000,
      status: 'pending'
    },
    {
      id: 'ads',
      title: 'إنشاء الإعلانات',
      description: 'كتابة نصوص إعلانية جذابة ومؤثرة',
      icon: PenTool,
      duration: 3500,
      status: 'pending'
    },
    {
      id: 'optimize',
      title: 'تحسين الحملة',
      description: 'ضبط الإعدادات للحصول على أفضل النتائج',
      icon: Sparkles,
      duration: 2000,
      status: 'pending'
    }
  ];

  const steps = processingSteps.length > 0 ? processingSteps : defaultSteps;

  // Simulate processing steps
  useEffect(() => {
    if (!isProcessing) return;

    let stepIndex = 0;
    const processStep = () => {
      if (stepIndex >= steps.length) {
        setShowResults(true);
        setTimeout(() => {
          onProcessingComplete?.();
        }, 1500);
        return;
      }

      const step = steps[stepIndex];
      setCurrentStep(stepIndex);

      // Update step status to processing
      const updatedSteps = [...steps];
      updatedSteps[stepIndex] = { ...step, status: 'processing' };

      setTimeout(() => {
        // Mark step as completed
        setCompletedSteps(prev => [...prev, stepIndex]);
        updatedSteps[stepIndex] = { ...step, status: 'completed' };
        
        // Update overall progress
        const progress = ((stepIndex + 1) / steps.length) * 100;
        setOverallProgress(progress);

        stepIndex++;
        setTimeout(processStep, 500);
      }, step.duration || 2000);
    };

    processStep();
  }, [isProcessing, steps, onProcessingComplete]);

  const getStepStatus = (index) => {
    if (completedSteps.includes(index)) return 'completed';
    if (currentStep === index && isProcessing) return 'processing';
    return 'pending';
  };

  const getStepVariant = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="ai-processor">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          >
            معالج الذكاء الاصطناعي
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            جاري تحليل موقعك وإنشاء حملة إعلانية ذكية مخصصة لنشاطك التجاري
          </motion.p>
        </div>

        {/* Website Info */}
        {website && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{website.title || 'الموقع الإلكتروني'}</h3>
                    <p className="text-muted-foreground">{website.url}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    جاري التحليل
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                التقدم العام
              </CardTitle>
              <CardDescription>
                {completedSteps.length} من {steps.length} خطوات مكتملة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>التقدم</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Processing Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4 mb-8"
        >
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const StepIcon = step.icon;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card className={`transition-all duration-500 ${
                  status === 'processing' ? 'ring-2 ring-purple-500 shadow-lg' : ''
                } ${
                  status === 'completed' ? 'bg-green-50 border-green-200' : ''
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {/* Step Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === 'completed' 
                          ? 'bg-green-100' 
                          : status === 'processing' 
                            ? 'bg-purple-100' 
                            : 'bg-gray-100'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : status === 'processing' ? (
                          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                        ) : (
                          <StepIcon className="w-6 h-6 text-gray-600" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{step.title}</h3>
                          <Badge variant={getStepVariant(status)}>
                            {status === 'completed' ? 'مكتمل' : 
                             status === 'processing' ? 'جاري التنفيذ' : 'في الانتظار'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                        
                        {/* Step Progress */}
                        {status === 'processing' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3"
                          >
                            <Progress value={75} className="h-2" />
                          </motion.div>
                        )}
                      </div>

                      {/* Step Number */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        status === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : status === 'processing' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Results Preview */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4 mx-auto"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <CardTitle className="text-2xl text-green-800">
                    تم إنشاء الحملة بنجاح!
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    حملتك الإعلانية الذكية جاهزة للمراجعة والإطلاق
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-muted-foreground">إعلانات مُنشأة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">15</div>
                      <div className="text-sm text-muted-foreground">كلمة مفتاحية</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-muted-foreground">معدل الجودة</div>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    onClick={onNext}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    مراجعة الحملة
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Animation */}
        {isProcessing && !showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AIProcessor;
