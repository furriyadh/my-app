import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';

export const useCampaignData = (initialCampaignId = null) => {
  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Performance data
  const [performanceData, setPerformanceData] = useState({});
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);
  
  // Refs for cleanup
  const abortControllerRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Set current campaign when initialCampaignId changes
  useEffect(() => {
    if (initialCampaignId && campaigns.length > 0) {
      const campaign = campaigns.find(c => c.id === initialCampaignId);
      if (campaign) {
        setCurrentCampaign(campaign);
      }
    }
  }, [initialCampaignId, campaigns]);

  // Load all campaigns
  const loadCampaigns = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const response = await apiService.getCampaigns();
      
      if (response.success) {
        setCampaigns(response.campaigns || []);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'فشل في جلب الحملات');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading campaigns:', error);
        setError('فشل في جلب الحملات');
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load specific campaign
  const loadCampaign = useCallback(async (campaignId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getCampaign(campaignId);
      
      if (response.success) {
        setCurrentCampaign(response.campaign);
        
        // Update in campaigns list
        setCampaigns(prev => 
          prev.map(c => c.id === campaignId ? response.campaign : c)
        );
        
        return { success: true, campaign: response.campaign };
      } else {
        setError(response.error || 'فشل في جلب الحملة');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      const errorMessage = 'فشل في جلب الحملة';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new campaign
  const createCampaign = useCallback(async (campaignData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.createCampaign(campaignData);
      
      if (response.success) {
        const newCampaign = response.campaign;
        setCampaigns(prev => [newCampaign, ...prev]);
        setCurrentCampaign(newCampaign);
        setLastUpdated(new Date());
        
        return { success: true, campaign: newCampaign };
      } else {
        setError(response.error || 'فشل في إنشاء الحملة');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      const errorMessage = 'فشل في إنشاء الحملة';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update campaign
  const updateCampaign = useCallback(async (campaignId, updates) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.updateCampaign(campaignId, updates);
      
      if (response.success) {
        const updatedCampaign = response.campaign;
        
        // Update in campaigns list
        setCampaigns(prev => 
          prev.map(c => c.id === campaignId ? updatedCampaign : c)
        );
        
        // Update current campaign if it's the same
        if (currentCampaign?.id === campaignId) {
          setCurrentCampaign(updatedCampaign);
        }
        
        setLastUpdated(new Date());
        
        return { success: true, campaign: updatedCampaign };
      } else {
        setError(response.error || 'فشل في تحديث الحملة');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      const errorMessage = 'فشل في تحديث الحملة';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentCampaign]);

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.deleteCampaign(campaignId);
      
      if (response.success) {
        // Remove from campaigns list
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        
        // Clear current campaign if it's the deleted one
        if (currentCampaign?.id === campaignId) {
          setCurrentCampaign(null);
        }
        
        // Clear performance data
        setPerformanceData(prev => {
          const newData = { ...prev };
          delete newData[campaignId];
          return newData;
        });
        
        setLastUpdated(new Date());
        
        return { success: true };
      } else {
        setError(response.error || 'فشل في حذف الحملة');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      const errorMessage = 'فشل في حذف الحملة';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentCampaign]);

  // Launch campaign
  const launchCampaign = useCallback(async (campaignId) => {
    return await updateCampaign(campaignId, { status: 'ACTIVE' });
  }, [updateCampaign]);

  // Pause campaign
  const pauseCampaign = useCallback(async (campaignId) => {
    return await updateCampaign(campaignId, { status: 'PAUSED' });
  }, [updateCampaign]);

  // Load campaign performance data
  const loadPerformanceData = useCallback(async (campaignId, dateRange = '7d') => {
    try {
      setIsLoadingPerformance(true);
      
      const response = await apiService.getCampaignPerformance(campaignId, { dateRange });
      
      if (response.success) {
        setPerformanceData(prev => ({
          ...prev,
          [campaignId]: response.performance
        }));
        
        return { success: true, performance: response.performance };
      } else {
        console.error('Failed to load performance data:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      return { success: false, error: 'فشل في جلب بيانات الأداء' };
    } finally {
      setIsLoadingPerformance(false);
    }
  }, []);

  // Start auto-refresh
  const startAutoRefresh = useCallback((intervalMs = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      loadCampaigns(false); // Don't show loading for auto-refresh
    }, intervalMs);
  }, [loadCampaigns]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Get campaigns by status
  const getCampaignsByStatus = useCallback((status) => {
    return campaigns.filter(campaign => campaign.status === status);
  }, [campaigns]);

  // Get campaign performance
  const getCampaignPerformance = useCallback((campaignId) => {
    return performanceData[campaignId] || null;
  }, [performanceData]);

  return {
    // State
    campaigns,
    currentCampaign,
    isLoading,
    error,
    lastUpdated,
    performanceData,
    isLoadingPerformance,
    
    // Actions
    loadCampaigns,
    loadCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    pauseCampaign,
    loadPerformanceData,
    
    // Campaign management
    setCurrentCampaign,
    
    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,
    
    // Utilities
    getCampaignsByStatus,
    getCampaignPerformance,
    
    // Computed values
    activeCampaigns: getCampaignsByStatus('ACTIVE'),
    pausedCampaigns: getCampaignsByStatus('PAUSED'),
    draftCampaigns: getCampaignsByStatus('DRAFT'),
    totalCampaigns: campaigns.length,
    hasError: !!error,
    isEmpty: campaigns.length === 0 && !isLoading
  };
};

export default useCampaignData;

