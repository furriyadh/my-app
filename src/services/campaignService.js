// Google Ads AI Platform - Campaign Service
// =========================================

import { apiService } from './api'
import { 
  CAMPAIGN_STATUS, 
  CAMPAIGN_TYPES, 
  BID_STRATEGIES,
  PERFORMANCE_METRICS,
  TIME_RANGES,
  DEFAULT_VALUES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../utils/constants'
import { 
  generateCampaignId, 
  formatCurrency, 
  formatPercentage,
  getStorageItem,
  setStorageItem
} from '../utils/helpers'

/**
 * Campaign Service
 * Handles all campaign-related operations
 */
class CampaignService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
    this.listeners = new Map()
    
    // Performance tracking
    this.performanceCache = new Map()
    this.performanceCacheTimeout = 2 * 60 * 1000 // 2 minutes
  }

  // ===== EVENT SYSTEM =====

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Emit event
   */
  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * Get cached data
   */
  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  /**
   * Set cache data
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Clear cache
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // ===== CAMPAIGN CRUD OPERATIONS =====

  /**
   * Get all campaigns
   */
  async getCampaigns(filters = {}) {
    try {
      const cacheKey = `campaigns_${JSON.stringify(filters)}`
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }

      const response = await apiService.getCampaigns(filters)
      
      if (response.success) {
        const campaigns = response.campaigns.map(campaign => 
          this.enrichCampaignData(campaign)
        )
        
        const result = {
          success: true,
          campaigns,
          total: response.total || campaigns.length,
          filters: filters
        }
        
        this.setCache(cacheKey, result)
        this.emit('campaigns:loaded', result)
        
        return result
      } else {
        throw new Error(response.error || ERROR_MESSAGES.OPERATION_FAILED)
      }
      
    } catch (error) {
      console.error('Get campaigns failed:', error)
      const errorResult = {
        success: false,
        campaigns: [],
        error: error.message || ERROR_MESSAGES.OPERATION_FAILED
      }
      
      this.emit('campaigns:error', errorResult)
      return errorResult
    }
  }

  /**
   * Get single campaign
   */
  async getCampaign(campaignId) {
    try {
      const cacheKey = `campaign_${campaignId}`
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }

      const response = await apiService.getCampaign(campaignId)
      
      if (response.success) {
        const campaign = this.enrichCampaignData(response.campaign)
        
        const result = {
          success: true,
          campaign
        }
        
        this.setCache(cacheKey, result)
        this.emit('campaign:loaded', { campaignId, campaign })
        
        return result
      } else {
        throw new Error(response.error || ERROR_MESSAGES.CAMPAIGN_NOT_FOUND)
      }
      
    } catch (error) {
      console.error('Get campaign failed:', error)
      const errorResult = {
        success: false,
        campaign: null,
        error: error.message || ERROR_MESSAGES.CAMPAIGN_NOT_FOUND
      }
      
      this.emit('campaign:error', { campaignId, error: errorResult })
      return errorResult
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(campaignData) {
    try {
      // Validate campaign data
      const validation = this.validateCampaignData(campaignData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Enrich campaign data with defaults
      const enrichedData = this.prepareCampaignData(campaignData)
      
      const response = await apiService.createCampaign(enrichedData)
      
      if (response.success) {
        const campaign = this.enrichCampaignData(response.campaign)
        
        // Clear campaigns cache
        this.clearCache('campaigns_')
        
        const result = {
          success: true,
          campaign,
          message: SUCCESS_MESSAGES.CAMPAIGN_CREATED
        }
        
        this.emit('campaign:created', { campaign })
        
        return result
      } else {
        throw new Error(response.error || ERROR_MESSAGES.CAMPAIGN_CREATION_FAILED)
      }
      
    } catch (error) {
      console.error('Create campaign failed:', error)
      const errorResult = {
        success: false,
        campaign: null,
        error: error.message || ERROR_MESSAGES.CAMPAIGN_CREATION_FAILED
      }
      
      this.emit('campaign:error', errorResult)
      return errorResult
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, updates) {
    try {
      // Validate updates
      const validation = this.validateCampaignData(updates, false)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const response = await apiService.updateCampaign(campaignId, updates)
      
      if (response.success) {
        const campaign = this.enrichCampaignData(response.campaign)
        
        // Clear related cache
        this.clearCache(`campaign_${campaignId}`)
        this.clearCache('campaigns_')
        
        const result = {
          success: true,
          campaign,
          message: SUCCESS_MESSAGES.CAMPAIGN_UPDATED
        }
        
        this.emit('campaign:updated', { campaignId, campaign, updates })
        
        return result
      } else {
        throw new Error(response.error || ERROR_MESSAGES.CAMPAIGN_UPDATE_FAILED)
      }
      
    } catch (error) {
      console.error('Update campaign failed:', error)
      const errorResult = {
        success: false,
        campaign: null,
        error: error.message || ERROR_MESSAGES.CAMPAIGN_UPDATE_FAILED
      }
      
      this.emit('campaign:error', { campaignId, error: errorResult })
      return errorResult
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId) {
    try {
      const response = await apiService.deleteCampaign(campaignId)
      
      if (response.success) {
        // Clear related cache
        this.clearCache(`campaign_${campaignId}`)
        this.clearCache('campaigns_')
        this.performanceCache.delete(campaignId)
        
        const result = {
          success: true,
          message: 'تم حذف الحملة بنجاح'
        }
        
        this.emit('campaign:deleted', { campaignId })
        
        return result
      } else {
        throw new Error(response.error || 'فشل في حذف الحملة')
      }
      
    } catch (error) {
      console.error('Delete campaign failed:', error)
      const errorResult = {
        success: false,
        error: error.message || 'فشل في حذف الحملة'
      }
      
      this.emit('campaign:error', { campaignId, error: errorResult })
      return errorResult
    }
  }

  // ===== CAMPAIGN ACTIONS =====

  /**
   * Launch campaign
   */
  async launchCampaign(campaignData) {
    try {
      // Validate campaign is ready for launch
      const validation = this.validateCampaignForLaunch(campaignData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const response = await apiService.launchCampaign(campaignData)
      
      if (response.success) {
        const campaign = this.enrichCampaignData(response.campaign)
        
        // Clear cache
        this.clearCache(`campaign_${campaign.id}`)
        this.clearCache('campaigns_')
        
        const result = {
          success: true,
          campaign,
          message: SUCCESS_MESSAGES.CAMPAIGN_LAUNCHED
        }
        
        this.emit('campaign:launched', { campaign })
        
        return result
      } else {
        throw new Error(response.error || 'فشل في إطلاق الحملة')
      }
      
    } catch (error) {
      console.error('Launch campaign failed:', error)
      const errorResult = {
        success: false,
        campaign: null,
        error: error.message || 'فشل في إطلاق الحملة'
      }
      
      this.emit('campaign:error', errorResult)
      return errorResult
    }
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId) {
    try {
      const response = await apiService.pauseCampaign(campaignId)
      
      if (response.success) {
        const campaign = this.enrichCampaignData(response.campaign)
        
        // Clear cache
        this.clearCache(`campaign_${campaignId}`)
        this.clearCache('campaigns_')
        
        const result = {
          success: true,
          campaign,
          message: SUCCESS_MESSAGES.CAMPAIGN_PAUSED
        }
        
        this.emit('campaign:paused', { campaignId, campaign })
        
        return result
      } else {
        throw new Error(response.error || 'فشل في إيقاف الحملة')
      }
      
    } catch (error) {
      console.error('Pause campaign failed:', error)
      const errorResult = {
        success: false,
        campaign: null,
        error: error.message || 'فشل في إيقاف الحملة'
      }
      
      this.emit('campaign:error', { campaignId, error: errorResult })
      return errorResult
    }
  }

  // ===== PERFORMANCE & ANALYTICS =====

  /**
   * Get campaign performance
   */
  async getCampaignPerformance(campaignId, options = {}) {
    try {
      const cacheKey = `performance_${campaignId}_${JSON.stringify(options)}`
      const cached = this.performanceCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.performanceCacheTimeout) {
        return cached.data
      }

      const response = await apiService.getCampaignPerformance(campaignId, options)
      
      if (response.success) {
        const performance = this.enrichPerformanceData(response.performance)
        
        const result = {
          success: true,
          performance,
          campaignId,
          options
        }
        
        // Cache performance data
        this.performanceCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        })
        
        this.emit('performance:loaded', { campaignId, performance })
        
        return result
      } else {
        throw new Error(response.error || 'فشل في جلب بيانات الأداء')
      }
      
    } catch (error) {
      console.error('Get campaign performance failed:', error)
      const errorResult = {
        success: false,
        performance: null,
        error: error.message || 'فشل في جلب بيانات الأداء'
      }
      
      this.emit('performance:error', { campaignId, error: errorResult })
      return errorResult
    }
  }

  /**
   * Get campaigns summary
   */
  async getCampaignsSummary() {
    try {
      const cacheKey = 'campaigns_summary'
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }

      const campaignsResponse = await this.getCampaigns()
      
      if (!campaignsResponse.success) {
        throw new Error(campaignsResponse.error)
      }

      const campaigns = campaignsResponse.campaigns
      const summary = this.calculateCampaignsSummary(campaigns)
      
      const result = {
        success: true,
        summary
      }
      
      this.setCache(cacheKey, result)
      this.emit('summary:loaded', { summary })
      
      return result
      
    } catch (error) {
      console.error('Get campaigns summary failed:', error)
      return {
        success: false,
        summary: null,
        error: error.message || 'فشل في جلب ملخص الحملات'
      }
    }
  }

  // ===== DATA ENRICHMENT =====

  /**
   * Enrich campaign data with computed fields
   */
  enrichCampaignData(campaign) {
    if (!campaign) return null

    return {
      ...campaign,
      
      // Status helpers
      isActive: campaign.status === CAMPAIGN_STATUS.ACTIVE,
      isPaused: campaign.status === CAMPAIGN_STATUS.PAUSED,
      isDraft: campaign.status === CAMPAIGN_STATUS.DRAFT,
      
      // Formatted values
      formattedBudget: formatCurrency(campaign.budget, campaign.currency),
      formattedSpend: formatCurrency(campaign.spend || 0, campaign.currency),
      
      // Performance metrics
      ctr: campaign.clicks && campaign.impressions ? 
           (campaign.clicks / campaign.impressions) * 100 : 0,
      cpc: campaign.clicks && campaign.cost ? 
           campaign.cost / campaign.clicks : 0,
      conversionRate: campaign.conversions && campaign.clicks ? 
                     (campaign.conversions / campaign.clicks) * 100 : 0,
      
      // Formatted performance
      formattedCTR: formatPercentage(
        campaign.clicks && campaign.impressions ? 
        campaign.clicks / campaign.impressions : 0
      ),
      formattedCPC: formatCurrency(
        campaign.clicks && campaign.cost ? 
        campaign.cost / campaign.clicks : 0, 
        campaign.currency
      ),
      formattedConversionRate: formatPercentage(
        campaign.conversions && campaign.clicks ? 
        campaign.conversions / campaign.clicks : 0
      ),
      
      // Dates
      createdAtFormatted: campaign.createdAt ? 
                         new Date(campaign.createdAt).toLocaleDateString('ar-SA') : null,
      updatedAtFormatted: campaign.updatedAt ? 
                         new Date(campaign.updatedAt).toLocaleDateString('ar-SA') : null,
      
      // Budget utilization
      budgetUtilization: campaign.budget ? 
                        ((campaign.spend || 0) / campaign.budget) * 100 : 0
    }
  }

  /**
   * Enrich performance data
   */
  enrichPerformanceData(performance) {
    if (!performance) return null

    return {
      ...performance,
      
      // Calculated metrics
      ctr: performance.impressions ? 
           (performance.clicks / performance.impressions) * 100 : 0,
      cpc: performance.clicks ? 
           performance.cost / performance.clicks : 0,
      cpa: performance.conversions ? 
           performance.cost / performance.conversions : 0,
      roas: performance.conversionValue ? 
            performance.conversionValue / performance.cost : 0,
      conversionRate: performance.clicks ? 
                     (performance.conversions / performance.clicks) * 100 : 0,
      
      // Formatted values
      formattedCost: formatCurrency(performance.cost || 0),
      formattedCTR: formatPercentage(
        performance.impressions ? 
        performance.clicks / performance.impressions : 0
      ),
      formattedCPC: formatCurrency(
        performance.clicks ? 
        performance.cost / performance.clicks : 0
      ),
      formattedCPA: formatCurrency(
        performance.conversions ? 
        performance.cost / performance.conversions : 0
      ),
      formattedConversionRate: formatPercentage(
        performance.clicks ? 
        performance.conversions / performance.clicks : 0
      ),
      formattedROAS: `${(performance.conversionValue ? 
                      performance.conversionValue / performance.cost : 0).toFixed(2)}x`
    }
  }

  // ===== VALIDATION =====

  /**
   * Validate campaign data
   */
  validateCampaignData(data, isRequired = true) {
    const errors = []

    if (isRequired) {
      if (!data.name || data.name.trim().length < 3) {
        errors.push('اسم الحملة يجب أن يكون 3 أحرف على الأقل')
      }
      
      if (!data.budget || data.budget < 1) {
        errors.push('الميزانية يجب أن تكون أكبر من 0')
      }
    }

    if (data.name && data.name.length > 100) {
      errors.push('اسم الحملة يجب ألا يزيد عن 100 حرف')
    }

    if (data.budget && (data.budget < 1 || data.budget > 1000000)) {
      errors.push('الميزانية يجب أن تكون بين 1 و 1,000,000')
    }

    if (data.type && !Object.values(CAMPAIGN_TYPES).includes(data.type)) {
      errors.push('نوع الحملة غير صحيح')
    }

    if (data.bidStrategy && !Object.values(BID_STRATEGIES).includes(data.bidStrategy)) {
      errors.push('استراتيجية المزايدة غير صحيحة')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate campaign for launch
   */
  validateCampaignForLaunch(campaign) {
    const errors = []

    if (!campaign.name) {
      errors.push('اسم الحملة مطلوب')
    }

    if (!campaign.budget || campaign.budget <= 0) {
      errors.push('ميزانية الحملة مطلوبة')
    }

    if (!campaign.keywords || campaign.keywords.length === 0) {
      errors.push('الكلمات المفتاحية مطلوبة')
    }

    if (!campaign.ads || campaign.ads.length === 0) {
      errors.push('الإعلانات مطلوبة')
    }

    if (!campaign.targetLocations || campaign.targetLocations.length === 0) {
      errors.push('المواقع المستهدفة مطلوبة')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Prepare campaign data for API
   */
  prepareCampaignData(data) {
    return {
      ...DEFAULT_VALUES.CAMPAIGN,
      ...data,
      id: data.id || generateCampaignId(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Calculate campaigns summary
   */
  calculateCampaignsSummary(campaigns) {
    const summary = {
      total: campaigns.length,
      active: 0,
      paused: 0,
      draft: 0,
      totalBudget: 0,
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      averageCTR: 0,
      averageCPC: 0,
      averageConversionRate: 0
    }

    campaigns.forEach(campaign => {
      // Count by status
      switch (campaign.status) {
        case CAMPAIGN_STATUS.ACTIVE:
          summary.active++
          break
        case CAMPAIGN_STATUS.PAUSED:
          summary.paused++
          break
        case CAMPAIGN_STATUS.DRAFT:
          summary.draft++
          break
      }

      // Sum metrics
      summary.totalBudget += campaign.budget || 0
      summary.totalSpend += campaign.spend || 0
      summary.totalImpressions += campaign.impressions || 0
      summary.totalClicks += campaign.clicks || 0
      summary.totalConversions += campaign.conversions || 0
    })

    // Calculate averages
    if (summary.totalImpressions > 0) {
      summary.averageCTR = (summary.totalClicks / summary.totalImpressions) * 100
    }

    if (summary.totalClicks > 0) {
      summary.averageCPC = summary.totalSpend / summary.totalClicks
      summary.averageConversionRate = (summary.totalConversions / summary.totalClicks) * 100
    }

    return summary
  }

  /**
   * Get campaign status color
   */
  getStatusColor(status) {
    const colors = {
      [CAMPAIGN_STATUS.ACTIVE]: 'green',
      [CAMPAIGN_STATUS.PAUSED]: 'yellow',
      [CAMPAIGN_STATUS.DRAFT]: 'gray',
      [CAMPAIGN_STATUS.REMOVED]: 'red',
      [CAMPAIGN_STATUS.ENDED]: 'gray'
    }
    return colors[status] || 'gray'
  }

  /**
   * Get campaign status text in Arabic
   */
  getStatusText(status) {
    const texts = {
      [CAMPAIGN_STATUS.ACTIVE]: 'نشطة',
      [CAMPAIGN_STATUS.PAUSED]: 'متوقفة',
      [CAMPAIGN_STATUS.DRAFT]: 'مسودة',
      [CAMPAIGN_STATUS.REMOVED]: 'محذوفة',
      [CAMPAIGN_STATUS.ENDED]: 'منتهية'
    }
    return texts[status] || status
  }

  /**
   * Export campaigns data
   */
  async exportCampaigns(format = 'csv', filters = {}) {
    try {
      const campaignsResponse = await this.getCampaigns(filters)
      
      if (!campaignsResponse.success) {
        throw new Error(campaignsResponse.error)
      }

      const campaigns = campaignsResponse.campaigns
      
      if (format === 'csv') {
        return this.exportToCSV(campaigns)
      } else if (format === 'json') {
        return this.exportToJSON(campaigns)
      } else {
        throw new Error('تنسيق التصدير غير مدعوم')
      }
      
    } catch (error) {
      console.error('Export campaigns failed:', error)
      return {
        success: false,
        error: error.message || 'فشل في تصدير الحملات'
      }
    }
  }

  /**
   * Export to CSV format
   */
  exportToCSV(campaigns) {
    const headers = [
      'الاسم', 'الحالة', 'النوع', 'الميزانية', 'الإنفاق', 
      'الظهور', 'النقرات', 'معدل النقر', 'تكلفة النقرة', 'التحويلات'
    ]
    
    const rows = campaigns.map(campaign => [
      campaign.name,
      this.getStatusText(campaign.status),
      campaign.type,
      campaign.formattedBudget,
      campaign.formattedSpend,
      campaign.impressions || 0,
      campaign.clicks || 0,
      campaign.formattedCTR,
      campaign.formattedCPC,
      campaign.conversions || 0
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    return {
      success: true,
      data: csvContent,
      filename: `campaigns_${new Date().toISOString().split('T')[0]}.csv`
    }
  }

  /**
   * Export to JSON format
   */
  exportToJSON(campaigns) {
    return {
      success: true,
      data: JSON.stringify({
        exportDate: new Date().toISOString(),
        totalCampaigns: campaigns.length,
        campaigns: campaigns
      }, null, 2),
      filename: `campaigns_${new Date().toISOString().split('T')[0]}.json`
    }
  }
}

// Create and export singleton instance
export const campaignService = new CampaignService()
export default campaignService

