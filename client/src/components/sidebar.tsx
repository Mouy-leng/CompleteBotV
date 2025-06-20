import { useState } from "react";
import { Link, useLocation } from "wouter";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "fas fa-tachometer-alt" },
  { name: "Bot Management", href: "/bot-management", icon: "fas fa-robot" },
  { name: "Live Trading", href: "/live-trading", icon: "fas fa-chart-area" },
  { name: "Backtesting", href: "/backtesting", icon: "fas fa-history" },
  { name: "AI Models", href: "/ai-models", icon: "fas fa-brain" },
  { name: "Risk Management", href: "/risk-management", icon: "fas fa-shield-alt" },
  { name: "Settings", href: "/settings", icon: "fas fa-cog" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="trading-surface w-72 flex-shrink-0 border-r trading-border relative">
      <div className="p-8 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-12 h-12 trading-primary-gradient rounded-xl flex items-center justify-center trading-glow">
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold trading-text">Trading Bot</h1>
            <p className="text-sm trading-muted">CAPITALend AI</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-3 flex-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "trading-primary-gradient text-white font-medium trading-glow"
                    : "text-trading-muted hover:text-trading-text hover:bg-trading-surface-light"
                }`}
              >
                <i className={`${item.icon} text-lg w-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-trading-primary'}`}></i>
                <span className="font-medium">{item.name}</span>
                {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Environment Indicator */}
        <div className="mb-6 p-4 rounded-xl bg-trading-success/10 border border-trading-success/20">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-trading-success rounded-full trading-glow-success"></div>
            <div>
              <p className="text-sm font-medium text-trading-success">Demo Mode</p>
              <p className="text-xs trading-muted">Safe Environment</p>
            </div>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="border-t trading-border pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 trading-primary-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg">
              JT
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium trading-text">John Trader</p>
              <p className="text-xs trading-muted">Pro Account • Online</p>
            </div>
            <button className="p-2 text-trading-muted hover:text-trading-primary rounded-lg transition-colors">
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
