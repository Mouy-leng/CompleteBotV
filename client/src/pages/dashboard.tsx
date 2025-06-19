import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import MetricsOverview from "@/components/metrics-overview";
import TradingChart from "@/components/trading-chart";
import AiSignals from "@/components/ai-signals";
import ActiveTrades from "@/components/active-trades";
import SystemStatus from "@/components/system-status";
import RecentActivity from "@/components/recent-activity";
import { useWebSocket } from "@/lib/websocket";

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("EUR/USD");
  const [timeframe, setTimeframe] = useState("1H");
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/1"], // Demo user ID
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log("WebSocket message received:", lastMessage);
      // Handle real-time updates here
      // For example, update market data, portfolio, etc.
    }
  }, [lastMessage]);

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden trading-dark">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trading-primary"></div>
            <p className="mt-4 text-trading-muted">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden trading-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="trading-surface border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Trading Dashboard</h2>
              <p className="text-trading-muted">Real-time AI-powered trading system</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-trading-success/20 px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-trading-success animate-pulse-success' : 'bg-trading-error'}`}></div>
                <span className={`text-sm font-medium ${isConnected ? 'text-trading-success' : 'text-trading-error'}`}>
                  {isConnected ? 'Live Trading Active' : 'Connection Lost'}
                </span>
              </div>
              <button className="p-2 text-trading-muted hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <i className="fas fa-bell"></i>
              </button>
              <button className="p-2 text-trading-muted hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <i className="fas fa-user-cog"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Metrics Overview */}
          <MetricsOverview portfolio={dashboardData?.portfolio} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Trading Chart */}
            <div className="lg:col-span-2">
              <TradingChart 
                symbol={selectedSymbol}
                timeframe={timeframe}
                onSymbolChange={setSelectedSymbol}
                onTimeframeChange={setTimeframe}
              />
            </div>

            {/* AI Signals */}
            <AiSignals signals={dashboardData?.aiSignals} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Active Trades */}
            <ActiveTrades trades={dashboardData?.activeTrades} />

            {/* System Status */}
            <SystemStatus status={dashboardData?.systemStatus} />
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={dashboardData?.activities} />
        </main>
      </div>
    </div>
  );
}
