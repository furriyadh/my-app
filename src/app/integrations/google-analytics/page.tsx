'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';

// CSS styles for visual effects
const styles = `
  @keyframes float-slow {
    0%, 100% { 
      transform: translateY(0px) translateX(0px); 
      opacity: 0.8;
    }
    25% { 
      transform: translateY(-15px) translateX(10px); 
      opacity: 0.6;
    }
    50% { 
      transform: translateY(-25px) translateX(-5px); 
      opacity: 0.9;
    }
    75% { 
      transform: translateY(-10px) translateX(-15px); 
      opacity: 0.5;
    }
  }
  
  @keyframes float-medium {
    0%, 100% { 
      transform: translateY(0px) translateX(0px) scale(1); 
      opacity: 0.7;
    }
    33% { 
      transform: translateY(-20px) translateX(15px) scale(1.2); 
      opacity: 0.5;
    }
    66% { 
      transform: translateY(-10px) translateX(-10px) scale(0.8); 
      opacity: 0.9;
    }
  }
  
  @keyframes float-fast {
    0%, 100% { 
      transform: translateY(0px) translateX(0px) rotate(0deg); 
      opacity: 0.6;
    }
    20% { 
      transform: translateY(-12px) translateX(8px) rotate(90deg); 
      opacity: 0.8;
    }
    40% { 
      transform: translateY(-20px) translateX(-5px) rotate(180deg); 
      opacity: 0.4;
    }
    60% { 
      transform: translateY(-8px) translateX(-12px) rotate(270deg); 
      opacity: 0.9;
    }
    80% { 
      transform: translateY(-15px) translateX(5px) rotate(360deg); 
      opacity: 0.5;
    }
  }
  
  .animate-float-slow {
    animation: float-slow 8s ease-in-out infinite;
  }
  
  .animate-float-medium {
    animation: float-medium 6s ease-in-out infinite;
  }
  
  .animate-float-fast {
    animation: float-fast 4s ease-in-out infinite;
  }
  
  .property-card {
    --glow-x: 50%;
    --glow-y: 50%;
    --glow-intensity: 0;
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .property-card::before {
    content: '';
    position: absolute;
    inset: -40px;
    border-radius: 68px;
    background: radial-gradient(
      1000px circle at var(--glow-x) var(--glow-y),
      rgba(251, 146, 60, calc(var(--glow-intensity) * 1)) 0%,
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.7)) 15%,
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.5)) 30%,
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.3)) 50%,
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.15)) 70%,
      transparent 90%
    );
    pointer-events: none;
    z-index: -1;
    transition: all 0.15s ease;
    filter: blur(25px);
    opacity: var(--glow-intensity);
  }
  
  .property-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 28px;
    background: radial-gradient(
      700px circle at var(--glow-x) var(--glow-y),
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.35)) 0%,
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.2)) 25%,
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.1)) 45%,
      rgba(251, 146, 60, calc(var(--glow-intensity) * 0.05)) 60%,
      transparent 80%
    );
    pointer-events: none;
    z-index: 1;
    opacity: var(--glow-intensity);
    transition: opacity 0.15s ease;
  }
  
  .property-card:hover {
    transform: translateY(-2px);
  }
  
  .property-item {
    transition: all 0.3s ease;
  }
  
  .property-item:hover {
    transform: translateX(4px);
    box-shadow: 
      0 0 20px rgba(251, 146, 60, 0.15),
      inset 0 0 30px rgba(251, 146, 60, 0.05);
  }
  
  .property-item.selected {
    border-color: rgba(34, 197, 94, 0.5) !important;
    background: rgba(34, 197, 94, 0.1) !important;
  }
`;

interface AnalyticsProperty {
    name: string;
    displayName: string;
    propertyType: string;
    createTime: string;
    accountName?: string;
}

interface LinkedProperty {
    property_id: string;
    property_name: string;
    account_name?: string;
}

// Component to handle searchParams
const GoogleAnalyticsContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<AnalyticsProperty[]>([]);
    const [linkedProperties, setLinkedProperties] = useState<LinkedProperty[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [alreadyLinkedNotification, setAlreadyLinkedNotification] = useState<{
        show: boolean;
        propertyName: string;
        propertyId: string;
    } | null>(null);

    useEffect(() => {
        // Check for OAuth success
        const authSuccess = searchParams.get('auth_success');
        if (authSuccess === 'true') {
            console.log('✅ OAuth completed successfully');
            // Clear URL parameters
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('auth_success');
                url.searchParams.delete('message');
                window.history.replaceState({}, '', url.toString());
            }
        }
        fetchLinkedProperties();
        fetchProperties();
    }, [searchParams]);

    // Fetch linked properties from database
    const fetchLinkedProperties = async () => {
        try {
            const response = await fetch('/api/analytics/connected');
            const data = await response.json();

            if (data.success && data.properties) {
                setLinkedProperties(data.properties);
                console.log('📋 Linked properties:', data.properties);
            }
        } catch (err) {
            console.error('Error fetching linked properties:', err);
        }
    };

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/analytics/properties');
            const data = await response.json();

            if (data.success) {
                setProperties(data.properties || []);
                if (data.properties?.length === 0) {
                    setError('No properties found in your account. Make sure you have a GA4 Property.');
                }
            } else {
                setError(data.message || 'Failed to fetch properties');
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    // Check if a property is already linked
    const isPropertyLinked = (propertyName: string): boolean => {
        return linkedProperties.some(lp => lp.property_id === propertyName);
    };

    const handleSave = async () => {
        if (!selectedProperty) {
            alert('Please select a property');
            return;
        }

        // Check if already linked
        if (isPropertyLinked(selectedProperty)) {
            const prop = properties.find(p => p.name === selectedProperty);
            setAlreadyLinkedNotification({
                show: true,
                propertyName: prop?.displayName || selectedProperty,
                propertyId: selectedProperty
            });
            return;
        }

        try {
            setSaving(true);

            // Get selected property details
            const selectedProp = properties.find(p => p.name === selectedProperty);

            // 1. Save property to Supabase
            const response = await fetch('/api/analytics/connected', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    propertyId: selectedProperty,
                    propertyName: selectedProp?.displayName || null,
                    accountName: selectedProp?.accountName || null,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Check if already exists
                if (result.alreadyExists) {
                    setAlreadyLinkedNotification({
                        show: true,
                        propertyName: selectedProp?.displayName || selectedProperty,
                        propertyId: selectedProperty
                    });
                    return;
                }

                // 2. Add admin
                console.log('📧 Adding admin to property...');
                const adminResponse = await fetch('/api/analytics/add-admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        propertyId: selectedProperty,
                    }),
                });

                const adminResult = await adminResponse.json();
                if (adminResult.success) {
                    console.log('✅ Admin added successfully');
                } else if (adminResult.alreadyExists) {
                    console.log('⚠️ Admin already exists');
                } else {
                    console.warn('⚠️ Could not add admin:', adminResult.message);
                }

                // Save to localStorage for quick access
                localStorage.setItem('selected_analytics_property', selectedProperty);
                router.push('/integrations');
            } else {
                alert(result.message || 'Failed to save property');
            }

        } catch (err) {
            console.error('Error saving property:', err);
            alert('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* CSS Styles */}
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            <div className="min-h-screen bg-black overflow-x-hidden">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center">
                                <svg viewBox="0 0 64 64" className="w-8 h-8">
                                    <g transform="matrix(.363638 0 0 .363636 -3.272763 -2.909091)">
                                        <path d="M130 29v132c0 14.77 10.2 23 21 23 10 0 21-7 21-23V30c0-13.54-10-22-21-22s-21 9.33-21 21z" fill="#f9ab00" />
                                        <g fill="#e37400">
                                            <path d="M75 96v65c0 14.77 10.2 23 21 23 10 0 21-7 21-23V97c0-13.54-10-22-21-22s-21 9.33-21 21z" />
                                            <circle cx="41" cy="163" r="21" />
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">
                                Google Analytics Properties
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Select a property to connect to your dashboard
                        </p>
                    </div>

                    {/* Already Linked Notification */}
                    {alreadyLinkedNotification?.show && (
                        <div className="max-w-md mx-auto mb-6">
                            <div
                                className="relative rounded-[20px] border border-blue-500/30 bg-[#080814] p-5 overflow-hidden"
                                style={{
                                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(59, 130, 246, 0.1)'
                                }}
                            >
                                {/* Glow effect */}
                                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>

                                {/* Header */}
                                <div className="relative flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"></div>
                                        <span className="text-blue-400 text-sm font-semibold">Already Linked</span>
                                    </div>
                                    <button
                                        onClick={() => setAlreadyLinkedNotification(null)}
                                        className="text-gray-600 hover:text-blue-400 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Property Name */}
                                <div className="relative mb-4">
                                    <p className="text-gray-400 text-sm">
                                        Property <span className="font-semibold text-blue-300">{alreadyLinkedNotification.propertyName}</span> is already linked to your account.
                                    </p>
                                </div>

                                {/* Success Icon */}
                                <div className="relative flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Check className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => {
                                        setAlreadyLinkedNotification(null);
                                        router.push('/integrations');
                                    }}
                                    className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-sm font-bold transition-all hover:from-blue-400 hover:to-emerald-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                                >
                                    <span>Go to Integrations</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                {/* Bottom glow */}
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="max-w-2xl mx-auto">
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400">Searching for properties...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                                <p className="text-red-300 text-lg mb-6">{error}</p>
                                <GlowButton
                                    onClick={() => router.push('/integrations')}
                                    variant="blue"
                                >
                                    Back to Integrations
                                </GlowButton>
                            </div>
                        ) : properties.length > 0 ? (
                            <>
                                {/* Properties List Card */}
                                <div
                                    className="property-card relative group"
                                    onMouseMove={(e) => {
                                        const card = e.currentTarget;
                                        const rect = card.getBoundingClientRect();
                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                        const y = ((e.clientY - rect.top) / rect.height) * 100;

                                        requestAnimationFrame(() => {
                                            card.style.setProperty('--glow-x', `${x}%`);
                                            card.style.setProperty('--glow-y', `${y}%`);
                                            card.style.setProperty('--glow-intensity', '1');
                                        });
                                    }}
                                    onMouseLeave={(e) => {
                                        const card = e.currentTarget;
                                        requestAnimationFrame(() => {
                                            card.style.setProperty('--glow-intensity', '0');
                                        });
                                    }}
                                >
                                    {/* Outer container with orange glow */}
                                    <div className="relative rounded-[28px] p-[2px] bg-gradient-to-br from-orange-500/60 via-yellow-400/40 to-amber-500/60 shadow-2xl shadow-orange-500/30 transition-all duration-500 hover:shadow-orange-500/50 overflow-hidden">

                                        {/* Inner container - dark orange background */}
                                        <div className="relative rounded-[26px] bg-[#100800] backdrop-blur-xl p-5 overflow-hidden">
                                            {/* Floating particles - orange */}
                                            <div className="absolute top-5 left-6 w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-float-slow"></div>
                                            <div className="absolute top-10 right-12 w-1 h-1 bg-yellow-300/50 rounded-full animate-float-medium"></div>
                                            <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-orange-300/40 rounded-full animate-float-slow"></div>
                                            <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-amber-400/40 rounded-full animate-float-fast"></div>
                                            <div className="absolute bottom-10 right-8 w-1.5 h-1.5 bg-yellow-400/50 rounded-full animate-float-medium"></div>

                                            {/* Corner glows */}
                                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                            {/* Properties list - scrollable with max height */}
                                            <div className="space-y-3 relative z-10 max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent">
                                                {properties.map((property) => {
                                                    const isSelected = selectedProperty === property.name;
                                                    const isLinked = isPropertyLinked(property.name);

                                                    return (
                                                        <div
                                                            key={property.name}
                                                            onClick={() => setSelectedProperty(property.name)}
                                                            className={`property-item cursor-pointer rounded-xl p-4 border transition-all duration-300 ${isSelected
                                                                    ? 'bg-green-500/10 border-green-500/50'
                                                                    : isLinked
                                                                        ? 'bg-blue-500/10 border-blue-500/30'
                                                                        : 'bg-[#1a0d00] border-orange-500/20 hover:bg-[#2a1500] hover:border-orange-500/40'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${isSelected
                                                                            ? 'bg-green-500/20 border-2 border-green-400/50'
                                                                            : isLinked
                                                                                ? 'bg-blue-500/20 border-2 border-blue-400/50'
                                                                                : 'bg-[#0a0700] border border-orange-500/20'
                                                                        }`}>
                                                                        <svg viewBox="0 0 64 64" className="w-6 h-6">
                                                                            <g transform="matrix(.363638 0 0 .363636 -3.272763 -2.909091)">
                                                                                <path d="M130 29v132c0 14.77 10.2 23 21 23 10 0 21-7 21-23V30c0-13.54-10-22-21-22s-21 9.33-21 21z" fill="#f9ab00" />
                                                                                <g fill="#e37400">
                                                                                    <path d="M75 96v65c0 14.77 10.2 23 21 23 10 0 21-7 21-23V97c0-13.54-10-22-21-22s-21 9.33-21 21z" />
                                                                                    <circle cx="41" cy="163" r="21" />
                                                                                </g>
                                                                            </g>
                                                                        </svg>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="text-white font-semibold text-base truncate">
                                                                                {property.displayName}
                                                                            </h3>
                                                                            {/* Linked Badge */}
                                                                            {isLinked && (
                                                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                                                                                    Linked
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-gray-400 text-sm font-mono truncate">
                                                                            {property.name}
                                                                        </p>
                                                                        {property.accountName && (
                                                                            <p className="text-gray-500 text-xs mt-1">
                                                                                Account: {property.accountName}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Selection indicator */}
                                                                {isSelected && (
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Button */}
                                <div className="mt-8 flex justify-center">
                                    <GlowButton
                                        onClick={handleSave}
                                        disabled={!selectedProperty || saving}
                                        variant="blue"
                                    >
                                        <span className="flex items-center gap-2">
                                            {saving ? 'Linking...' : 'Link'}
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </GlowButton>
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-16 text-gray-500 text-sm">
                        © 2025, Furriyadh. All rights reserved.
                    </div>
                </div>
            </div>
        </>
    );
};

// Main component with Suspense wrapper
export default function GoogleAnalyticsSetupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <GoogleAnalyticsContent />
        </Suspense>
    );
}
