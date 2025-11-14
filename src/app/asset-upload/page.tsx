'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Video,
  FileText,
  X,
  Check,
  Sparkles,
  Zap,
  Eye,
  Download,
  Trash2,
  Edit,
  Copy,
  Share2,
  Folder,
  Filter,
  Search,
  Grid3x3,
  List,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Maximize2,
  Tag,
  Clock,
  HardDrive,
  TrendingUp
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: Date;
  url: string;
  thumbnail?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  aiTags?: string[];
  aiOptimized?: boolean;
  dimensions?: { width: number; height: number };
}

const AssetUploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI-Powered Stats
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const optimizedFiles = files.filter(f => f.aiOptimized).length;
  const completedFiles = files.filter(f => f.status === 'completed').length;

  // Mock AI Processing
  const processFileWithAI = async (file: File): Promise<Partial<UploadedFile>> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI tags generation
    const mockTags = [
      'Product', 'Marketing', 'Campaign', 'Banner', 'Advertisement',
      'Social Media', 'Website', 'Landing Page', 'Email', 'Mobile'
    ];
    
    const aiTags = mockTags.slice(0, Math.floor(Math.random() * 5) + 2);
    
    // Mock dimensions
    const dimensions = {
      width: Math.floor(Math.random() * 2000) + 500,
      height: Math.floor(Math.random() * 2000) + 500
    };

    return {
      aiTags,
      aiOptimized: true,
      dimensions
    };
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'document',
      size: file.size,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and AI processing
    newFiles.forEach(async (newFile, index) => {
      // Upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f => 
          f.id === newFile.id ? { ...f, progress } : f
        ));
      }

      // Update to processing
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, status: 'processing', progress: 100 } : f
      ));

      // AI Processing
      const aiData = await processFileWithAI(selectedFiles[index]);
      
      // Update to completed
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, ...aiData, status: 'completed' } : f
      ));
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.aiTags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Asset Upload & Management</h1>
            <p className="text-gray-400 text-lg">Upload, organize, and optimize your media assets with AI</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/75 transition-all duration-300 flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Assets
          </motion.button>
        </div>

        {/* AI Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 mb-6"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-1">AI-Powered Asset Optimization</h3>
                <p className="text-white/80">Automatic tagging, compression, and format conversion for all uploads</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white/80 text-sm">AI Optimized</p>
                <p className="text-white font-bold text-2xl">{optimizedFiles}/{files.length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={HardDrive}
          label="Total Storage Used"
          value={formatFileSize(totalSize)}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={ImageIcon}
          label="Total Assets"
          value={files.length}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={Sparkles}
          label="AI Optimized"
          value={`${optimizedFiles}/${files.length}`}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedFiles}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Drag & Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 mb-8 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="p-12 text-center">
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="inline-flex p-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6"
          >
            <Upload className="w-12 h-12 text-indigo-400" />
          </motion.div>
          
          <h3 className="text-white font-bold text-2xl mb-2">
            {isDragging ? 'Drop files here' : 'Drag & Drop your assets'}
          </h3>
          <p className="text-gray-400 mb-6">
            or <button
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              browse files
            </button>
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Images
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Videos
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-4"
        >
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or AI tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', icon: Folder },
              { value: 'image', label: 'Images', icon: ImageIcon },
              { value: 'video', label: 'Videos', icon: Video },
              { value: 'document', label: 'Docs', icon: FileText }
            ].map((filter) => (
              <motion.button
                key={filter.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(filter.value as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filterType === filter.value
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </motion.button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Bulk Actions */}
          {selectedFiles.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-600 rounded-xl text-white font-medium"
            >
              <span>{selectedFiles.size} selected</span>
              <button className="p-1 hover:bg-white/20 rounded transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-white/20 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Files Grid/List */}
      {filteredFiles.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 group ${
                viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFileSelection(file.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                    selectedFiles.has(file.id)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'bg-gray-800 border-gray-600 group-hover:border-indigo-500'
                  }`}
                >
                  {selectedFiles.has(file.id) && <Check className="w-4 h-4 text-white" />}
                </motion.button>
              </div>

              {/* Status Badge */}
              {file.status !== 'completed' && (
                <div className="absolute top-3 right-3 z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    file.status === 'uploading' ? 'bg-blue-500/20 text-blue-400' :
                    file.status === 'processing' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {file.status === 'uploading' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {file.status === 'processing' && <Sparkles className="w-3 h-3 animate-pulse" />}
                    {file.status === 'error' && <AlertCircle className="w-3 h-3" />}
                    {file.status === 'uploading' ? 'Uploading' : 
                     file.status === 'processing' ? 'AI Processing' : 'Error'}
                  </div>
                </div>
              )}

              {/* Thumbnail */}
              <div className={`${viewMode === 'grid' ? 'mb-4' : 'w-32 h-32 flex-shrink-0'} relative overflow-hidden rounded-xl bg-gray-800`}>
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {file.type === 'video' ? (
                      <Video className="w-12 h-12 text-gray-600" />
                    ) : (
                      <FileText className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteFile(file.id)}
                    className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </motion.button>
                </div>
              </div>

              {/* File Info */}
              <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 mr-2">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                      {file.aiOptimized && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Tags */}
                {file.aiTags && file.aiTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {file.aiTags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {file.aiTags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded-lg text-xs font-medium">
                        +{file.aiTags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                {file.status === 'uploading' && file.progress !== undefined && (
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      ></motion.div>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{file.progress}%</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex p-6 rounded-full bg-gray-800 mb-4">
            <ImageIcon className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">No assets found</h3>
          <p className="text-gray-400">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first asset to get started'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AssetUploadPage;

