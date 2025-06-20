interface MetricsOverviewProps {
  portfolio?: {
    totalValue: string;
    dailyPnL: string;
    riskExposure: string;
  };
}

export default function MetricsOverview({ portfolio }: MetricsOverviewProps) {
  const totalValue = portfolio ? parseFloat(portfolio.totalValue) : 0;
  const dailyPnL = portfolio ? parseFloat(portfolio.dailyPnL) : 0;
  const riskExposure = portfolio ? parseFloat(portfolio.riskExposure) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
  };

  const metrics = [
    {
      title: "Total Balance",
      value: formatLargeNumber(totalValue),
      change: "+12.5%",
      changeValue: "+$6,420",
      icon: "fas fa-wallet",
      trend: "up",
      gradient: "trading-primary-gradient",
    },
    {
      title: "Daily P&L",
      value: formatCurrency(dailyPnL),
      change: dailyPnL >= 0 ? "+1.6%" : "-1.6%",
      changeValue: dailyPnL >= 0 ? "+$820" : "-$820",
      icon: "fas fa-chart-line",
      trend: dailyPnL >= 0 ? "up" : "down",
      gradient: dailyPnL >= 0 ? "trading-success-gradient" : "trading-error-gradient",
    },
    {
      title: "Open Trades",
      value: "12",
      change: "+3",
      changeValue: "Active",
      icon: "fas fa-exchange-alt",
      trend: "up",
      gradient: "trading-secondary bg-gradient-to-r from-teal-400 to-cyan-400",
    },
    {
      title: "Win Rate",
      value: "87%",
      change: "+2.1%",
      changeValue: "This Week",
      icon: "fas fa-target",
      trend: "up",
      gradient: "bg-gradient-to-r from-purple-400 to-pink-400",
    },
    {
      title: "Risk Exposure",
      value: formatPercentage(riskExposure),
      change: "Low Risk",
      changeValue: "Safe Zone",
      icon: "fas fa-shield-alt",
      trend: riskExposure > 5 ? "down" : "up",
      gradient: riskExposure > 5 ? "trading-error-gradient" : "trading-success-gradient",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="trading-surface rounded-2xl p-6 trading-glow relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 ${metric.gradient} opacity-10`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <i className={`${metric.icon} text-white text-lg`}></i>
              </div>
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                metric.trend === 'up' ? 'text-trading-success' : 
                metric.trend === 'down' ? 'text-trading-error' : 'text-trading-muted'
              }`}>
                <i className={`fas ${metric.trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                <span>{metric.change}</span>
              </div>
            </div>
            
            <div className="mb-3">
              <h3 className="text-2xl font-bold trading-text mb-1">{metric.value}</h3>
              <p className="text-xs trading-muted font-medium">{metric.changeValue}</p>
            </div>
            
            <p className="text-xs trading-muted uppercase tracking-wide font-medium">
              {metric.title}
            </p>

            {/* Mini trend line */}
            <div className="mt-3 h-1 bg-trading-border rounded-full overflow-hidden">
              <div className={`h-full ${metric.gradient} rounded-full transition-all duration-500`} 
                   style={{ width: `${Math.random() * 40 + 40}%` }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
