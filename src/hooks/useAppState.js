import { useState, useContext, createContext } from 'react';

// Create context
const AppStateContext = createContext();

// Provider component
export const AppStateProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState('website');
  const [websiteData, setWebsiteData] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    // State
    currentStep,
    websiteData,
    selectedAccount,
    campaignData,
    userInfo,
    isAuthenticated,
    isProcessing,
    error,
    
    // Setters
    setCurrentStep,
    setWebsiteData,
    setSelectedAccount,
    setCampaignData,
    setUserInfo,
    setIsAuthenticated,
    setIsProcessing,
    setError,
    
    // Helper functions
    resetState: () => {
      setCurrentStep('website');
      setWebsiteData(null);
      setSelectedAccount(null);
      setCampaignData(null);
      setError(null);
    },
    
    goToStep: (step) => {
      setCurrentStep(step);
      setError(null);
    }
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// Hook to use the context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  
  return context;
};

// Default export
export default useAppState;

