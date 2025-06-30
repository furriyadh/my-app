import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Activity, 
  Cpu, 
  Network,
  Eye,
  Sparkles,
  Bot,
  Target,
  TrendingUp
} from 'lucide-react';

interface AILoadingScreenProps {
  onComplete: () => void;
}

const AILoadingScreen: React.FC<AILoadingScreenProps> = ({ onComplete }) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [aiText, setAiText] = useState('');
  const [showParticles, setShowParticles] = useState(true);

  const loadingStages = [
    { text: 'Initializing AI Neural Networks...', icon: Brain, duration: 1500 },
    { text: 'Connecting to Google Ads API...', icon: Network, duration: 1200 },
    { text: 'Processing Campaign Data...', icon: Cpu, duration: 1000 },
    { text: 'Analyzing Performance Metrics...', icon: Activity, duration: 1300 },
    { text: 'Generating AI Insights...', icon: Eye, duration: 1100 },
    { text: 'Optimizing Dashboard Experience...', icon: Target, duration: 900 },
    { text: 'AI Dashboard Ready!', icon: Sparkles, duration: 800 }
  ];

  // Typewriter effect for AI text
  const typewriterEffect = (text: string, callback?: () => void) => {
    setAiText('');
    let i = 0;
    const timer = setInterval(() => {
      setAiText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
        if (callback) callback();
      }
    }, 50);
  };

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  useEffect(() => {
    if (loadingStage < loadingStages.length) {
      const currentStage = loadingStages[loadingStage];
      typewriterEffect(currentStage.text, () => {
        setTimeout(() => {
          setLoadingStage(prev => prev + 1);
        }, currentStage.duration);
      });
    }
  }, [loadingStage]);

  // Generate floating particles
  const generateParticles = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          scale: 0
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ));
  };

  const CurrentIcon = loadingStage < loadingStages.length ? loadingStages[loadingStage].icon : Sparkles;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Neural Network Background */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 1000 1000">
              {Array.from({ length: 20 }, (_, i) => (
                <motion.circle
                  key={i}
                  cx={Math.random() * 1000}
                  cy={Math.random() * 1000}
                  r="2"
                  fill="#60A5FA"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
              {Array.from({ length: 15 }, (_, i) => (
                <motion.line
                  key={`line-${i}`}
                  x1={Math.random() * 1000}
                  y1={Math.random() * 1000}
                  x2={Math.random() * 1000}
                  y2={Math.random() * 1000}
                  stroke="#60A5FA"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Floating Particles */}
          {showParticles && generateParticles()}

          {/* Matrix Rain Effect */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 10 }, (_, i) => (
              <motion.div
                key={`matrix-${i}`}
                className="absolute text-green-400 text-xs font-mono"
                style={{ left: `${i * 10}%` }}
                initial={{ y: -100 }}
                animate={{ y: window.innerHeight + 100 }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {Array.from({ length: 20 }, () => Math.random() > 0.5 ? '1' : '0').join('')}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          {/* AI Brain Animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 360,
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 40px rgba(147, 51, 234, 0.7)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ]
            }}
            transition={{ 
              scale: { duration: 1 },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
          >
            <div className="relative">
              {/* Outer Ring */}
              <motion.div
                className="w-32 h-32 rounded-full border-4 border-blue-400 border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner Ring */}
              <motion.div
                className="absolute inset-4 rounded-full border-2 border-purple-400"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Center Icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  color: ["#60A5FA", "#A855F7", "#60A5FA"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CurrentIcon className="w-12 h-12 text-white" />
              </motion.div>

              {/* Orbiting Elements */}
              {[Bot, Zap, TrendingUp, Target].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="absolute w-8 h-8 flex items-center justify-center"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0'
                  }}
                  animate={{
                    rotate: 360,
                    x: Math.cos((index * Math.PI) / 2) * 60,
                    y: Math.sin((index * Math.PI) / 2) * 60
                  }}
                  transition={{
                    duration: 4 + index,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Icon className="w-6 h-6 text-blue-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              AI-Powered Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Next-Generation Google Ads Intelligence
            </p>
          </motion.div>

          {/* Loading Text with Typewriter Effect */}
          <motion.div
            className="text-center mb-8 h-16 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Cpu className="w-6 h-6 text-blue-400" />
              </motion.div>
              <span className="text-lg text-white font-mono">
                {aiText}
                <motion.span
                  className="inline-block w-0.5 h-5 bg-blue-400 ml-1"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </span>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="w-96 max-w-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="relative">
              {/* Background */}
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                {/* Progress Fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              
              {/* Progress Text */}
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>Initializing AI Systems</span>
                <span>{progress}%</span>
              </div>
            </div>
          </motion.div>

          {/* AI Features Preview */}
          <motion.div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            {[
              { icon: Brain, label: 'Neural Analytics' },
              { icon: Eye, label: 'Smart Insights' },
              { icon: Target, label: 'Auto Optimization' },
              { icon: TrendingUp, label: 'Predictive AI' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 + index * 0.1 }}
              >
                <feature.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <span className="text-sm text-gray-300">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Corner Decorations */}
        <motion.div
          className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-blue-400 opacity-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 3 }}
        />
        <motion.div
          className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-purple-400 opacity-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 3.1 }}
        />
        <motion.div
          className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-pink-400 opacity-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 3.2 }}
        />
        <motion.div
          className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-blue-400 opacity-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 3.3 }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AILoadingScreen;

