'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Check,
  Sparkles,
  Eye,
  Download,
  Trash2,
  Folder,
  Search,
  Grid3x3,
  List,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HardDrive
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
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for language changes
  useEffect(() => {
    const updateLanguage = () => {
      const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    };
    updateLanguage();
    window.addEventListener('languageChange', updateLanguage);
    return () => window.removeEventListener('languageChange', updateLanguage);
  }, []);

  // AI-Powered Stats
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const optimizedFiles = files.filter(f => f.aiOptimized).length;
  const completedFiles = files.filter(f => f.status === 'completed').length;

  // Mock AI Processing
  const processFileWithAI = async (file: File): Promise<Partial<UploadedFile>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockTags = [
      'Product', 'Marketing', 'Campaign', 'Banner', 'Advertisement',
      'Social Media', 'Website', 'Landing Page', 'Email', 'Mobile'
    ];

    const aiTags = mockTags.slice(0, Math.floor(Math.random() * 5) + 2);

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
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f =>
          f.id === newFile.id ? { ...f, progress } : f
        ));
      }

      setFiles(prev => prev.map(f =>
        f.id === newFile.id ? { ...f, status: 'processing', progress: 100 } : f
      ));

      const aiData = await processFileWithAI(selectedFiles[index]);

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

  return (
    <>
      <div className="mb-[25px]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-[25px]">
          <div>
            <h5 className="!mb-0 text-lg font-bold text-gray-900 dark:text-white">
              {isRTL ? 'رفع وإدارة الأصول' : 'Asset Upload & Management'}
            </h5>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {isRTL ? 'قم برفع وتنظيم وتحسين ملفاتك باستخدام AI' : 'Upload, organize, and optimize your media assets with AI'}
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {isRTL ? 'رفع الملفات' : 'Upload Assets'}
          </button>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px] mb-[25px]">
          {/* Storage Used */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'التخزين المستخدم' : 'Storage Used'}</p>
                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">{formatFileSize(totalSize)}</h5>
              </div>
            </div>
          </div>

          {/* Total Assets */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/10">
                <ImageIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'إجمالي الأصول' : 'Total Assets'}</p>
                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">{files.length}</h5>
              </div>
            </div>
          </div>

          {/* AI Optimized */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'محسّن بالذكاء' : 'AI Optimized'}</p>
                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">{optimizedFiles}/{files.length}</h5>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'مكتمل' : 'Completed'}</p>
                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">{completedFiles}</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className="trezo-card bg-white dark:bg-[#0c1427] p-[25px] rounded-md mb-[25px]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}>
            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>

            <h5 className="!mb-2 text-gray-900 dark:text-white">
              {isDragging ? (isRTL ? 'أفلت الملفات هنا' : 'Drop files here') : (isRTL ? 'اسحب وأفلت ملفاتك' : 'Drag & Drop your assets')}
            </h5>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {isRTL ? 'أو' : 'or'}{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                {isRTL ? 'تصفح الملفات' : 'browse files'}
              </button>
            </p>

            <div className="flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                {isRTL ? 'صور' : 'Images'}
              </div>
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                {isRTL ? 'فيديو' : 'Videos'}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {isRTL ? 'مستندات' : 'Documents'}
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        {files.length > 0 && (
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md mb-[25px]">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث بالاسم أو الوسوم...' : 'Search by name or AI tags...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: isRTL ? 'الكل' : 'All', icon: Folder },
                  { value: 'image', label: isRTL ? 'صور' : 'Images', icon: ImageIcon },
                  { value: 'video', label: isRTL ? 'فيديو' : 'Videos', icon: Video },
                  { value: 'document', label: isRTL ? 'مستندات' : 'Docs', icon: FileText }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterType(filter.value as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === filter.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* View Mode */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/10 rounded-lg text-primary-600 dark:text-primary-400 text-sm font-medium border border-primary-200 dark:border-primary-800">
                  <span>{selectedFiles.size} {isRTL ? 'محدد' : 'selected'}</span>
                  <button className="p-1 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Files Grid/List */}
        {filteredFiles.length > 0 ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[25px]'
            : 'space-y-[15px]'
          }>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`trezo-card bg-white dark:bg-[#0c1427] rounded-md overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 group ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'
                  }`}
              >
                {/* Selection Checkbox */}
                <div className={viewMode === 'grid' ? 'absolute top-3 left-3 z-10' : ''}>
                  <button
                    onClick={() => toggleFileSelection(file.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${selectedFiles.has(file.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-primary-400'
                      }`}
                  >
                    {selectedFiles.has(file.id) && <Check className="w-3 h-3 text-white" />}
                  </button>
                </div>

                {/* Status Badge */}
                {file.status !== 'completed' && (
                  <div className={viewMode === 'grid' ? 'absolute top-3 right-3 z-10' : ''}>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${file.status === 'uploading' ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' :
                        file.status === 'processing' ? 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400' :
                          'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
                      }`}>
                      {file.status === 'uploading' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {file.status === 'processing' && <Sparkles className="w-3 h-3 animate-pulse" />}
                      {file.status === 'error' && <AlertCircle className="w-3 h-3" />}
                      {file.status === 'uploading' ? (isRTL ? 'جاري الرفع' : 'Uploading') :
                        file.status === 'processing' ? (isRTL ? 'معالجة AI' : 'AI Processing') : (isRTL ? 'خطأ' : 'Error')}
                    </div>
                  </div>
                )}

                {/* Thumbnail */}
                <div className={`${viewMode === 'grid' ? 'mb-3 aspect-video' : 'w-20 h-20 flex-shrink-0'} relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800`}>
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {file.type === 'video' ? (
                        <Video className="w-8 h-8 text-gray-400" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all">
                      <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-300" />
                    </button>
                  </div>
                </div>

                {/* File Info */}
                <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 mr-2">
                      <p className="text-gray-900 dark:text-white font-medium text-sm truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                        {file.aiOptimized && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded text-xs">
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
                          className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {file.aiTags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded text-xs">
                          +{file.aiTags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{file.progress}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="trezo-card bg-white dark:bg-[#0c1427] p-[40px] rounded-md text-center">
            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h5 className="!mb-2 text-gray-900 dark:text-white">{isRTL ? 'لا توجد ملفات' : 'No assets found'}</h5>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchQuery || filterType !== 'all'
                ? (isRTL ? 'جرب تعديل البحث أو الفلتر' : 'Try adjusting your search or filters')
                : (isRTL ? 'ارفع أول ملف للبدء' : 'Upload your first asset to get started')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AssetUploadPage;
