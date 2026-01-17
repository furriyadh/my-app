'use client';

import React, { useState } from 'react';
import { X, TrendingUp, ShoppingBag, Youtube, BarChart3, Building2, Users, Globe, CheckCircle, AlertCircle } from 'lucide-react';

// Types for Google Accounts
interface GoogleAccount {
  id: string;
  name: string;
  type: 'google_ads' | 'merchant_center' | 'youtube' | 'analytics' | 'business';
  details?: {
    currency_code?: string;
    website_url?: string;
    subscriber_count?: number;
    view_count?: number;
    property_count?: number;
    location_count?: number;
  };
}

interface UserAccounts {
  google_ads: GoogleAccount[];
  merchant_center: GoogleAccount[];
  youtube: GoogleAccount[];
  analytics: GoogleAccount[];
  business: GoogleAccount[];
}

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (accounts: { [key: string]: string }) => void;
  accounts: UserAccounts;
  selectedAccounts: { [key: string]: string };
  campaignType?: string | null;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  accounts,
  selectedAccounts,
  campaignType
}) => {
  const [localSelectedAccounts, setLocalSelectedAccounts] = useState<{ [key: string]: string }>(selectedAccounts);

  if (!isOpen) return null;

  // Determine which account types are required based on campaign type
  const getRequiredAccountTypes = () => {
    const required = ['google_ads']; // Google Ads is always required

    if (campaignType === 'shopping') {
      required.push('merchant_center');
    }

    if (campaignType === 'video') {
      required.push('youtube');
    }

    return required;
  };

  const requiredAccountTypes = getRequiredAccountTypes();

  // Handle account selection
  const handleAccountSelect = (accountType: string, accountId: string) => {
    setLocalSelectedAccounts(prev => ({
      ...prev,
      [accountType]: accountId
    }));
  };

  // Handle account deselection
  const handleAccountDeselect = (accountType: string) => {
    setLocalSelectedAccounts(prev => {
      const newSelection = { ...prev };
      delete newSelection[accountType];
      return newSelection;
    });
  };

  // Handle save selection
  const handleSave = () => {
    // Validate required accounts are selected
    const missingRequired = requiredAccountTypes.filter(type => !localSelectedAccounts[type]);

    if (missingRequired.length > 0) {
      alert(`Please select the following required accounts: ${missingRequired.join(', ')}`);
      return;
    }

    onSelect(localSelectedAccounts);
  };

  // Get account type icon
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'google_ads':
        return <TrendingUp className="w-5 h-5" />;
      case 'merchant_center':
        return <ShoppingBag className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5" />;
      case 'business':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  // Get account type color
  const getAccountColor = (type: string) => {
    switch (type) {
      case 'google_ads':
        return 'blue';
      case 'merchant_center':
        return 'orange';
      case 'youtube':
        return 'red';
      case 'analytics':
        return 'green';
      case 'business':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Get account type name
  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'google_ads':
        return 'Google Ads Accounts';
      case 'merchant_center':
        return 'Merchant Center Accounts';
      case 'youtube':
        return 'YouTube Channels';
      case 'analytics':
        return 'Google Analytics Accounts';
      case 'business':
        return 'Google My Business Locations';
      default:
        return 'Accounts';
    }
  };

  // Format account details
  const formatAccountDetails = (account: GoogleAccount) => {
    const details = account.details;
    if (!details) return null;

    switch (account.type) {
      case 'google_ads':
        return details.currency_code ? `Currency: ${details.currency_code}` : null;
      case 'merchant_center':
        return details.website_url ? `Website: ${details.website_url}` : null;
      case 'youtube':
        return details.subscriber_count ? `${Number(details.subscriber_count).toLocaleString()} subscribers` : null;
      case 'analytics':
        return details.property_count ? `${details.property_count} properties` : null;
      case 'business':
        return details.location_count ? `${details.location_count} locations` : null;
      default:
        return null;
    }
  };

  // Render account section
  const renderAccountSection = (accountType: string, accountList: GoogleAccount[]) => {
    if (accountList.length === 0) return null;

    const isRequired = requiredAccountTypes.includes(accountType);
    const selectedAccountId = localSelectedAccounts[accountType];
    const color = getAccountColor(accountType);

    return (
      <div key={accountType} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`text-${color}-600`}>
            {getAccountIcon(accountType)}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getAccountTypeName(accountType)}
          </h3>
          {isRequired && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
              Required
            </span>
          )}
        </div>

        <div className="space-y-2">
          {accountList.map((account) => {
            const isSelected = selectedAccountId === account.id;
            const details = formatAccountDetails(account);

            return (
              <div
                key={account.id}
                onClick={() => {
                  if (isSelected) {
                    if (!isRequired) {
                      handleAccountDeselect(accountType);
                    }
                  } else {
                    handleAccountSelect(accountType, account.id);
                  }
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected
                    ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`text-${color}-600`}>
                        {getAccountIcon(accountType)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </h4>
                        {details && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {isSelected && (
                      <div className={`w-6 h-6 bg-${color}-600 rounded-full flex items-center justify-center`}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Check if all required accounts are selected
  const allRequiredSelected = requiredAccountTypes.every(type => localSelectedAccounts[type]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select Your Google Accounts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose which accounts to use for your campaign
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Campaign Type Info */}
          {campaignType && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Campaign Type: {campaignType.charAt(0).toUpperCase() + campaignType.slice(1).replace('-', ' ')}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {requiredAccountTypes.length > 1
                  ? `This campaign type requires: ${requiredAccountTypes.map(type => getAccountTypeName(type)).join(', ')}`
                  : 'Google Ads account is required for all campaigns'
                }
              </p>
            </div>
          )}

          {/* Account Sections */}
          <div className="space-y-6">
            {Object.entries(accounts).map(([accountType, accountList]) =>
              renderAccountSection(accountType, accountList)
            )}
          </div>

          {/* No Accounts Message */}
          {Object.values(accounts).every(list => list.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Accounts Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We couldn't find any Google accounts linked to your profile.
              </p>
              <button
                onClick={() => {
                  // Open OAuth in popup
                  const width = 500;
                  const height = 600;
                  const left = window.screen.width / 2 - width / 2;
                  const top = window.screen.height / 2 - height / 2;
                  window.open(
                    '/api/oauth/google',
                    'GoogleOAuthPopup',
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
                  );
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Connect Google Accounts
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {Object.values(accounts).some(list => list.length > 0) && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(localSelectedAccounts).length} account(s) selected
              {!allRequiredSelected && (
                <span className="text-red-600 dark:text-red-400 ml-2">
                  • Missing required accounts
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!allRequiredSelected}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                Save Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSelectionModal;

