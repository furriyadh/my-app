"use client";

import { cn } from "@/lib/utils";
import {
    Globe,
    Lock,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    Plus,
    FolderOpen,
    Zap,
    Upload,
    CreditCard,
    Bell,
    User,
} from "lucide-react";

interface SidebarItem {
    label: string;
    active?: boolean;
    badge?: string;
    icon?: React.ReactNode;
}

interface BrowserWindowProps {
    url?: string;
    children?: React.ReactNode;
    className?: string;
    imageSrc?: string;
    variant?: "chrome" | "safari";
    headerStyle?: "minimal" | "full";
    size?: "sm" | "md" | "lg" | "xl";
    showSidebar?: boolean;
    sidebarPosition?: "left" | "right" | "top" | "bottom";
    sidebarItems?: SidebarItem[];
}

const sizeClasses = {
    sm: "h-[300px]",
    md: "h-[400px]",
    lg: "h-[500px]",
    xl: "h-[600px]",
};

const defaultSidebarItems: SidebarItem[] = [
    { label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, active: true },
    { label: "New Campaign", icon: <Plus className="w-4 h-4" /> },
    { label: "My Campaigns", icon: <FolderOpen className="w-4 h-4" />, badge: "12" },
    { label: "Integrations", icon: <Zap className="w-4 h-4" />, badge: "3" },
    { label: "Asset Upload", icon: <Upload className="w-4 h-4" />, badge: "24" },
    { label: "Billing", icon: <CreditCard className="w-4 h-4" />, badge: "$150" },
    { label: "Accounts", icon: <User className="w-4 h-4" />, badge: "2" },
    { label: "Notifications", icon: <Bell className="w-4 h-4" />, badge: "7" },
    { label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

export function BrowserWindow({
    url = "https://app.adspro.ai/dashboard",
    children,
    className,
    imageSrc,
    variant = "chrome",
    headerStyle = "full",
    size = "lg",
    showSidebar = true,
    sidebarPosition = "left",
    sidebarItems = defaultSidebarItems,
}: BrowserWindowProps) {
    const renderSidebar = () => {
        if (!showSidebar) return null;

        const isVertical = sidebarPosition === "left" || sidebarPosition === "right";

        return (
            <div
                className={cn(
                    "bg-zinc-900/95 border-zinc-700/50",
                    isVertical ? "w-48 border-r flex-shrink-0" : "h-12 border-b w-full",
                    sidebarPosition === "right" && "border-l border-r-0 order-2"
                )}
            >
                {/* Sidebar Header */}
                {isVertical && (
                    <div className="p-3 border-b border-zinc-700/50">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-800/50 rounded-lg">
                            <Globe className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs text-zinc-400">Quick search...</span>
                        </div>
                    </div>
                )}

                {/* Recent Pages */}
                {isVertical && (
                    <div className="p-3 border-b border-zinc-700/50">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 px-2">
                            Recent Pages
                        </p>
                        <div className="space-y-1">
                            {["New Campaign", "Google Ads", "Integrations"].map((item, i) => (
                                <div
                                    key={i}
                                    className="text-xs text-zinc-400 px-2 py-1 hover:bg-zinc-800/50 rounded cursor-pointer"
                                >
                                    • {item}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Items */}
                <div className={cn("p-2", !isVertical && "flex items-center gap-2")}>
                    {sidebarItems.map((item, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                                item.active
                                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                            )}
                        >
                            {item.icon || <LayoutDashboard className="w-4 h-4" />}
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <span
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full",
                                        item.active
                                            ? "bg-purple-500/30 text-purple-300"
                                            : "bg-zinc-700 text-zinc-400"
                                    )}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDashboardContent = () => (
        <div className="flex-1 bg-zinc-950 p-4 overflow-hidden">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[10px] text-zinc-500">Home › Dashboard</p>
                    <h2 className="text-lg font-semibold text-white">Dashboard</h2>
                    <p className="text-xs text-zinc-400">
                        Monitor your advertising performance and manage campaigns
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
                {["Quick Campaign", "Report", "Analytics"].map((action, i) => (
                    <button
                        key={i}
                        className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-xs rounded-full hover:bg-zinc-700/50 transition-colors"
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-6 gap-3 mb-4">
                {[
                    { label: "REVENUE", value: "USD 0", change: "-0%", color: "green", icon: "$" },
                    { label: "SPEND", value: "USD 317.81", change: "-0%", color: "purple", icon: "@" },
                    { label: "ROAS", value: "4.50x", change: "-2%", color: "yellow", icon: "↗" },
                    { label: "CTR", value: "20.34%", change: "+5%", color: "purple", icon: "%" },
                    { label: "CPC", value: "USD 105.94", change: "-9%", color: "green", icon: "$" },
                    { label: "CONV. RATE", value: "0.00%", change: "-2%", color: "purple", icon: "%" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-3"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className={cn(
                                    "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold",
                                    stat.color === "green" && "bg-green-500/20 text-green-400",
                                    stat.color === "purple" && "bg-purple-500/20 text-purple-400",
                                    stat.color === "yellow" && "bg-yellow-500/20 text-yellow-400"
                                )}
                            >
                                {stat.icon}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase">{stat.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{stat.value}</p>
                        <p className="text-[10px] text-zinc-500">{stat.change}</p>
                    </div>
                ))}
            </div>

            {/* Performance Analytics Section */}
            <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Performance Analytics
                    </h3>
                    <div className="flex gap-1">
                        {["All", "Performance", "Demographics", "Financial"].map((tab, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "px-2 py-1 text-[10px] rounded",
                                    i === 0
                                        ? "bg-purple-600/20 text-purple-300"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Chart Area */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                        <p className="text-xs text-zinc-400 mb-2">📊 Monthly Analytics</p>
                        <div className="h-24 flex items-end gap-1">
                            {[40, 65, 35, 70, 50, 80, 45, 60, 55, 75, 40, 65].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-gradient-to-t from-purple-600/50 to-purple-400/20 rounded-t"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                        <p className="text-xs text-zinc-400 mb-2">🌍 Locations</p>
                        <p className="text-[10px] text-zinc-500">Clicks & Impressions by regions</p>
                        <div className="h-20 mt-2 bg-zinc-900/50 rounded flex items-center justify-center">
                            <Globe className="w-8 h-8 text-cyan-400/50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div
            className={cn(
                "relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/50 shadow-2xl flex flex-col",
                sizeClasses[size],
                className
            )}
        >
            {/* Browser Header */}
            <div
                className={cn(
                    "bg-zinc-800/90 backdrop-blur-sm border-b border-zinc-700/50 flex-shrink-0",
                    headerStyle === "minimal" ? "px-3 py-2" : "px-3 py-2"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
                    </div>

                    {variant === "chrome" && (
                        <>
                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-1 ml-2">
                                <button className="p-1 rounded hover:bg-zinc-700/50 transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-zinc-400" />
                                </button>
                                <button className="p-1 rounded hover:bg-zinc-700/50 transition-colors">
                                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                                </button>
                                <button className="p-1 rounded hover:bg-zinc-700/50 transition-colors">
                                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* URL Bar - Only show if headerStyle is 'full' */}
                    {headerStyle === "full" && (
                        <div className="flex-1 mx-2">
                            <div className="flex items-center gap-2 bg-zinc-900/80 rounded-lg px-3 py-1.5 border border-zinc-700/50">
                                <Lock className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-xs text-zinc-400 truncate font-mono">
                                    {url}
                                </span>
                            </div>
                        </div>
                    )}

                    {headerStyle === "minimal" && <div className="flex-1" />}

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-zinc-500" />
                    </div>
                </div>
            </div>

            {/* Browser Content */}
            <div
                className={cn(
                    "relative bg-zinc-950 flex-1 flex overflow-hidden",
                    sidebarPosition === "top" || sidebarPosition === "bottom"
                        ? "flex-col"
                        : "flex-row"
                )}
            >
                {(sidebarPosition === "left" || sidebarPosition === "top") && renderSidebar()}

                {imageSrc ? (
                    <div className="flex-1 overflow-hidden">
                        <img
                            src={imageSrc}
                            alt="Dashboard Preview"
                            className="w-full h-full object-cover object-top"
                        />
                    </div>
                ) : children ? (
                    <div className="flex-1 overflow-hidden">{children}</div>
                ) : (
                    renderDashboardContent()
                )}

                {(sidebarPosition === "right" || sidebarPosition === "bottom") &&
                    renderSidebar()}
            </div>
        </div>
    );
}

export default BrowserWindow;
