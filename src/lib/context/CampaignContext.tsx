'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CampaignData, AdType, BudgetData, ScheduleData, LocationData, AdCreativeData } from '@/lib/types/campaign';

interface CampaignState {
  campaignData: CampaignData;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

type CampaignAction =
  | { type: 'SET_CAMPAIGN_DATA'; payload: Partial<CampaignData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_CAMPAIGN' };

const initialState: CampaignState = {
  campaignData: {
    name: '',
    type: 'search' as AdType,
    websiteUrl: '',
    targetLocation: {
      name: '',
      coordinates: [0, 0],
      timezone: 'Asia/Riyadh',
      utcOffset: 3,
      country: 'السعودية'
    } as LocationData,
    budget: {
      dailyAmount: 50,
      currency: 'SAR',
      estimatedReach: 0,
      estimatedClicks: 0,
      avgCPC: 0
    } as BudgetData,
    schedule: {
      type: 'preset',
      preset: 'peak',
      timezone: 'Asia/Riyadh'
    } as ScheduleData,
    adCreative: {
      headlines: [],
      descriptions: [],
      finalUrl: ''
    } as AdCreativeData,
    accountChoice: 'existing',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  currentStep: 1,
  isLoading: false,
  error: null
};

const campaignReducer = (state: CampaignState, action: CampaignAction): CampaignState => {
  switch (action.type) {
    case 'SET_CAMPAIGN_DATA':
      return {
        ...state,
        campaignData: {
          ...state.campaignData,
          ...action.payload,
          updatedAt: new Date()
        }
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'RESET_CAMPAIGN':
      return {
        ...initialState,
        campaignData: {
          ...initialState.campaignData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
    
    default:
      return state;
  }
};

interface CampaignContextType {
  state: CampaignState;
  updateCampaignData: (data: Partial<CampaignData>) => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetCampaign: () => void;
  clearCampaignData: () => void;
  saveCampaignData: () => void;
  loadCampaignData: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
};

interface CampaignProviderProps {
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(campaignReducer, initialState);

  const updateCampaignData = (data: Partial<CampaignData>) => {
    dispatch({ type: 'SET_CAMPAIGN_DATA', payload: data });
  };

  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetCampaign = () => {
    dispatch({ type: 'RESET_CAMPAIGN' });
    // مسح البيانات من localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campaignData');
      localStorage.removeItem('currentStep');
    }
  };

  const clearCampaignData = () => {
    resetCampaign();
  };

  const saveCampaignData = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campaignData', JSON.stringify(state.campaignData));
        localStorage.setItem('currentStep', state.currentStep.toString());
      } catch (error) {
        console.error('Failed to save campaign data:', error);
      }
    }
  };

  const loadCampaignData = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedCampaignData = localStorage.getItem('campaignData');
        const savedCurrentStep = localStorage.getItem('currentStep');

        if (savedCampaignData) {
          const parsedData = JSON.parse(savedCampaignData);
          // التأكد من أن التواريخ محولة بشكل صحيح
          if (parsedData.createdAt) {
            parsedData.createdAt = new Date(parsedData.createdAt);
          }
          if (parsedData.updatedAt) {
            parsedData.updatedAt = new Date(parsedData.updatedAt);
          }
          dispatch({ type: 'SET_CAMPAIGN_DATA', payload: parsedData });
        }

        if (savedCurrentStep) {
          dispatch({ type: 'SET_CURRENT_STEP', payload: parseInt(savedCurrentStep) });
        }
      } catch (error) {
        console.error('Failed to load campaign data:', error);
      }
    }
  };

  // حفظ تلقائي عند تغيير البيانات
  useEffect(() => {
    saveCampaignData();
  }, [state.campaignData, state.currentStep]);

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    loadCampaignData();
  }, []);

  const value: CampaignContextType = {
    state,
    updateCampaignData,
    setCurrentStep,
    setLoading,
    setError,
    resetCampaign,
    clearCampaignData,
    saveCampaignData,
    loadCampaignData
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};

