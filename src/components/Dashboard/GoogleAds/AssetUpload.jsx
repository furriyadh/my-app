"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image,
  Video,
  FileText,
  X,
  Check,
  AlertCircle,
  Eye,
  Download,
  Crop,
  Palette,
  Zap,
  Save,
  RefreshCw,
  Plus,
  Camera,
  Film,
  Type,
  Link,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Star,
  ThumbsUp,
  MessageSquare,
  Share2
} from "lucide-react";

const AssetUpload = () => {
  const [assets, setAssets] = useState({
    headlines: [],
    descriptions: [],
    images: [],
    videos: [],
    logos: [],
    sitelinks: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [previewAsset, setPreviewAsset] = useState(null);

  const fileInputRef = useRef(null);

  // Asset requirements
  const assetRequirements = {
    headlines: {
      min: 3,
      max: 15,
      maxLength: 30,
      description: "Short, compelling headlines that grab attention"
    },
    descriptions: {
      min: 2,
      max: 4,
      maxLength: 90,
      description: "Detailed descriptions of your product or service"
    },
    images: {
      min: 1,
      max: 20,
      formats: ["JPG", "PNG", "GIF"],
      sizes: ["1200x628", "1200x1200", "960x1200"],
      description: "High-quality images that showcase your brand"
    },
    videos: {
      min: 0,
      max: 5,
      formats: ["MP4", "MOV", "AVI"],
      maxDuration: 30,
      description: "Engaging videos up to 30 seconds"
    }
  };

  // Sample headlines and descriptions
  const sampleContent = {
    headlines: [
      "Best Quality Products",
      "Free Shipping Worldwide",
      "24/7 Customer Support",
      "Premium Brand Experience",
      "Trusted by Millions"
    ],
    descriptions: [
      "Discover our premium collection of products designed for modern lifestyle.",
      "Get the best deals with free shipping and hassle-free returns.",
      "Join millions of satisfied customers who trust our quality and service.",
      "Experience excellence with our award-winning products and support."
    ]
  };

  // Handle file upload
  const handleFileUpload = (files, type) => {
    const newAssets = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      status: 'uploaded'
    }));

    setAssets(prev => ({
      ...prev,
      [type]: [...prev[type], ...newAssets]
    }));
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = e.dataTransfer.files;
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      const videoFiles = Array.from(files).filter(file => 
        file.type.startsWith('video/')
      );
      
      if (imageFiles.length > 0) {
        handleFileUpload(imageFiles, 'images');
      }
      if (videoFiles.length > 0) {
        handleFileUpload(videoFiles, 'videos');
      }
    }
  };

  // Add text asset
  const addTextAsset = (type, text) => {
    if (!text.trim()) return;
    
    const newAsset = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      length: text.trim().length,
      status: 'active'
    };

    setAssets(prev => ({
      ...prev,
      [type]: [...prev[type], newAsset]
    }));
  };

  // Remove asset
  const removeAsset = (type, id) => {
    setAssets(prev => ({
      ...prev,
      [type]: prev[type].filter(asset => asset.id !== id)
    }));
  };

  // Generate AI suggestions
  const generateAISuggestions = async (type) => {
    setIsLoading(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (type === 'headlines') {
        const suggestions = [
          "Revolutionary Products Await",
          "Transform Your Experience",
          "Quality You Can Trust",
          "Innovation Meets Excellence"
        ];
        
        suggestions.forEach(suggestion => {
          addTextAsset('headlines', suggestion);
        });
      } else if (type === 'descriptions') {
        const suggestions = [
          "Experience the difference with our premium products designed for your success.",
          "Join thousands of satisfied customers who have transformed their lives with us."
        ];
        
        suggestions.forEach(suggestion => {
          addTextAsset('descriptions', suggestion);
        });
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save assets
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Assets saved:", assets);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: "text", label: "Text Assets", icon: Type },
    { id: "images", label: "Images", icon: Image },
    { id: "videos", label: "Videos", icon: Video },
    { id: "sitelinks", label: "Sitelinks", icon: Link }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Assets & Creatives
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage your campaign assets for maximum impact
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Text Assets Tab */}
          {activeTab === "text" && (
            <div className="space-y-8">
              {/* Headlines */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Headlines ({assets.headlines.length}/{assetRequirements.headlines.max})
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {assetRequirements.headlines.description}
                    </p>
                  </div>
                  <button
                    onClick={() => generateAISuggestions('headlines')}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span>AI Generate</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Add new headline */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter a compelling headline (max 30 characters)"
                      maxLength={assetRequirements.headlines.maxLength}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTextAsset('headlines', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        addTextAsset('headlines', input.value);
                        input.value = '';
                      }}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Headlines list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assets.headlines.map(headline => (
                      <div key={headline.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <span className="text-gray-900 dark:text-white">{headline.text}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({headline.length}/{assetRequirements.headlines.maxLength})
                          </span>
                        </div>
                        <button
                          onClick={() => removeAsset('headlines', headline.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sample headlines */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quick Add Samples:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sampleContent.headlines.map((sample, index) => (
                        <button
                          key={index}
                          onClick={() => addTextAsset('headlines', sample)}
                          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Descriptions ({assets.descriptions.length}/{assetRequirements.descriptions.max})
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {assetRequirements.descriptions.description}
                    </p>
                  </div>
                  <button
                    onClick={() => generateAISuggestions('descriptions')}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span>AI Generate</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Add new description */}
                  <div className="flex space-x-2">
                    <textarea
                      placeholder="Enter a detailed description (max 90 characters)"
                      maxLength={assetRequirements.descriptions.maxLength}
                      rows={2}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addTextAsset('descriptions', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const textarea = e.target.previousElementSibling;
                        addTextAsset('descriptions', textarea.value);
                        textarea.value = '';
                      }}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-start"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Descriptions list */}
                  <div className="space-y-3">
                    {assets.descriptions.map(description => (
                      <div key={description.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <span className="text-gray-900 dark:text-white">{description.text}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({description.length}/{assetRequirements.descriptions.maxLength})
                          </span>
                        </div>
                        <button
                          onClick={() => removeAsset('descriptions', description.id)}
                          className="text-red-500 hover:text-red-700 transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === "images" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Images ({assets.images.length}/{assetRequirements.images.max})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {assetRequirements.images.description}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Images</span>
                </button>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Supports: {assetRequirements.images.formats.join(', ')} • Recommended sizes: {assetRequirements.images.sizes.join(', ')}
                </p>
              </div>

              {/* Images Grid */}
              {assets.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {assets.images.map(image => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setPreviewAsset(image)}
                          className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeAsset('images', image.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files, 'images');
                  }
                }}
              />
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Videos ({assets.videos.length}/{assetRequirements.videos.max})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {assetRequirements.videos.description}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Videos</span>
                </button>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Upload engaging videos for your campaign
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Supports: {assetRequirements.videos.formats.join(', ')} • Max duration: {assetRequirements.videos.maxDuration}s
                </p>
              </div>

              {/* Videos List */}
              {assets.videos.length > 0 && (
                <div className="space-y-4">
                  {assets.videos.map(video => (
                    <div key={video.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <Film className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{video.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {(video.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeAsset('videos', video.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sitelinks Tab */}
          {activeTab === "sitelinks" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sitelinks
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add additional links to specific pages on your website
                </p>
              </div>

              <div className="text-center py-12">
                <Link className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Sitelinks Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This feature will be available in the next update
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-green-900 dark:text-green-400 mb-3 flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Asset Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-green-800 dark:text-green-300 font-medium">Headlines:</span>
            <span className="ml-2 text-green-700 dark:text-green-400">
              {assets.headlines.length}/{assetRequirements.headlines.min} required
            </span>
          </div>
          <div>
            <span className="text-green-800 dark:text-green-300 font-medium">Descriptions:</span>
            <span className="ml-2 text-green-700 dark:text-green-400">
              {assets.descriptions.length}/{assetRequirements.descriptions.min} required
            </span>
          </div>
          <div>
            <span className="text-green-800 dark:text-green-300 font-medium">Images:</span>
            <span className="ml-2 text-green-700 dark:text-green-400">
              {assets.images.length}/{assetRequirements.images.min} required
            </span>
          </div>
          <div>
            <span className="text-green-800 dark:text-green-300 font-medium">Videos:</span>
            <span className="ml-2 text-green-700 dark:text-green-400">
              {assets.videos.length} uploaded
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <Eye className="w-4 h-4" />
          <span>Preview Assets</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <button className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Save as Draft
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Saving...' : 'Save & Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetUpload;

