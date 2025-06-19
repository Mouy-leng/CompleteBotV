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
    <div className="trading-surface w-64 flex-shrink-0 border-r border-gray-700">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 trading-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CAPITALend</h1>
            <p className="text-xs text-trading-muted">AI Trading Bot</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-trading-primary/20 text-trading-primary border-l-4 border-trading-primary"
                    : "text-trading-muted hover:text-white hover:bg-gray-700"
                }`}
              >
                <i className={`${item.icon} w-5`}></i>
                <span className={isActive ? "font-medium" : ""}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-trading-success rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">John Trader</p>
            <p className="text-xs text-trading-muted">Pro Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
