"use client";

import { useState } from "react";
import { Brain, ArrowRight, CheckCircle, Play, LayoutDashboard, Users, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Login from "@/components/ui/login";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BrowserWindow } from "@/components/ui/mock-browser-window";

export default function AIShowcaseSection() {
  const [config, setConfig] = useState({
    variant: "chrome" as "chrome" | "safari",
    headerStyle: "full" as "minimal" | "full",
    size: "lg" as "sm" | "md" | "lg" | "xl",
    showSidebar: true,
    sidebarPosition: "left" as "left" | "right" | "top" | "bottom",
    url: "https://app.adspro.ai/dashboard",
  });

  const [sidebarItems] = useState([
    { label: "Overview", active: true, icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Users", badge: "12", icon: <Users className="w-4 h-4" /> },
    { label: "Analytics", badge: "new", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ]);

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Small Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-300 text-xs font-medium uppercase tracking-wider">
              Unleash the power of
            </span>
          </div>

          <h2 className="text-3xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
            Unleash the power of <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">AI-Powered Ads</span>
          </h2>
        </div>

        {/* Browser Preview */}
        <div className="space-y-8">
          <div className="relative max-w-6xl mx-auto">
            {/* Glow Effect Behind Browser */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur-2xl opacity-60" />

            <div className="relative flex justify-center p-8 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
              <BrowserWindow
                variant={config.variant}
                headerStyle={config.headerStyle}
                size={config.size}
                showSidebar={config.showSidebar}
                sidebarPosition={config.sidebarPosition}
                url={config.url}
                sidebarItems={config.showSidebar ? sidebarItems : undefined}
                className="w-full max-w-5xl shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)]"
              />
            </div>
          </div>

          {/* Window Settings */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-white">Window Settings</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Browser Variant */}
              <div className="space-y-2">
                <Label className="text-sm">Browser</Label>
                <Select
                  value={config.variant}
                  onValueChange={(value: "chrome" | "safari") =>
                    setConfig((prev) => ({ ...prev, variant: value }))
                  }
                >
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-700/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chrome">Chrome</SelectItem>
                    <SelectItem value="safari">Safari</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Header Style */}
              <div className="space-y-2">
                <Label className="text-sm">Header Style</Label>
                <Select
                  value={config.headerStyle}
                  onValueChange={(value: "minimal" | "full") =>
                    setConfig((prev) => ({ ...prev, headerStyle: value }))
                  }
                >
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-700/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="full">Address Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label className="text-sm">Size</Label>
                <Select
                  value={config.size}
                  onValueChange={(value: "sm" | "md" | "lg" | "xl") =>
                    setConfig((prev) => ({ ...prev, size: value }))
                  }
                >
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-700/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* URL */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label className="text-sm">URL</Label>
                <Input
                  value={config.url}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  className="bg-zinc-900/50 border-zinc-700/50"
                />
              </div>

              {/* Show Sidebar Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Sidebar</Label>
                  <Switch
                    checked={config.showSidebar}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        showSidebar: checked,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Sidebar Position */}
              {config.showSidebar && (
                <div className="space-y-2">
                  <Label className="text-sm">Sidebar Position</Label>
                  <Select
                    value={config.sidebarPosition}
                    onValueChange={(value: "left" | "right" | "top" | "bottom") =>
                      setConfig((prev) => ({
                        ...prev,
                        sidebarPosition: value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quick Presets */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label className="text-sm">Quick Presets</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent border-zinc-700/50 hover:bg-purple-500/10 hover:border-purple-500/50"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        variant: "chrome",
                        headerStyle: "full",
                        showSidebar: true,
                        size: "lg",
                      }))
                    }
                  >
                    Chrome Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent border-zinc-700/50 hover:bg-purple-500/10 hover:border-purple-500/50"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        variant: "safari",
                        headerStyle: "minimal",
                        showSidebar: false,
                        size: "md",
                      }))
                    }
                  >
                    Safari Minimal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              >
                <Brain className="w-5 h-5" />
                <span>Start Creating AI-Powered Ads</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
              <Login />
            </DialogContent>
          </Dialog>

          <p className="text-zinc-500 mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Cancel anytime
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
