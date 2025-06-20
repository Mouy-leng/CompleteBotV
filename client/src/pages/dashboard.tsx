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
  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/1"], // Demo user ID
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });

  // Extract data with proper fallbacks
  const portfolio = dashboardData?.portfolio || {
    totalValue: "0.00",
    dailyPnL: "0.00", 
    riskExposure: "0.00"
  };
  const aiSignals = dashboardData?.aiSignals || [];
  const activeTrades = dashboardData?.activeTrades || [];
  const systemStatus = dashboardData?.systemStatus || [];
  const activities = dashboardData?.activities || [];

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
        {/* Modern Header */}
        <header className="trading-surface-light border-b trading-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold trading-text mb-1">Trading Bot</h1>
                <p className="trading-muted text-sm">CAPITALend AI • Real-time Analytics</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 rounded-xl trading-primary-gradient text-white font-medium text-sm">
                  <i className="fas fa-chart-line mr-2"></i>
                  EUR/USD +0.14%
                </div>
                <div className="px-4 py-2 rounded-xl bg-trading-success/20 text-trading-success font-medium text-sm">
                  <i className="fas fa-robot mr-2"></i>
                  AI Active
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${isConnected ? 'bg-trading-success/20' : 'bg-trading-error/20'}`}>
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-trading-success trading-glow-success' : 'bg-trading-error'}`}></div>
                  <span className={`text-sm font-medium ${isConnected ? 'text-trading-success' : 'text-trading-error'}`}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
                <div className="text-trading-muted text-sm">
                  <i className="fas fa-wifi mr-1"></i>
                  25ms
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-3 text-trading-muted hover:text-trading-primary hover:bg-trading-surface-light rounded-xl transition-all duration-200">
                  <i className="fas fa-bell text-lg"></i>
                </button>
                <button className="p-3 text-trading-muted hover:text-trading-primary hover:bg-trading-surface-light rounded-xl transition-all duration-200">
                  <i className="fas fa-cog text-lg"></i>
                </button>
                <div className="w-10 h-10 rounded-xl trading-primary-gradient flex items-center justify-center text-white font-bold">
                  JT
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 space-y-8">
          {/* Metrics Overview */}
          <MetricsOverview portfolio={portfolio} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Trading Chart */}
            <div className="xl:col-span-2">
              <TradingChart 
                symbol={selectedSymbol}
                timeframe={timeframe}
                onSymbolChange={setSelectedSymbol}
                onTimeframeChange={setTimeframe}
              />
            </div>

            {/* AI Signals */}
            <AiSignals signals={aiSignals} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Active Trades */}
            <ActiveTrades trades={activeTrades} />

            {/* System Status */}
            <SystemStatus status={systemStatus} />
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={activities} />
        </main>
      </div>
    </div>
  );
}
