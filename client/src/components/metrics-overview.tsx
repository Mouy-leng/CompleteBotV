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

  const metrics = [
    {
      title: "Total Portfolio Value",
      value: formatCurrency(totalValue),
      change: "+12.5%",
      icon: "fas fa-dollar-sign",
      color: "trading-success",
      bgColor: "bg-trading-success/20",
    },
    {
      title: "Daily P&L",
      value: formatCurrency(dailyPnL),
      change: dailyPnL >= 0 ? "+8.2%" : "-8.2%",
      icon: "fas fa-chart-line",
      color: "trading-primary",
      bgColor: "bg-trading-primary/20",
    },
    {
      title: "AI Win Rate",
      value: "85%",
      change: "85%",
      icon: "fas fa-robot",
      color: "trading-warning",
      bgColor: "bg-trading-warning/20",
      subtitle: "Last 100 Trades",
    },
    {
      title: "Risk Exposure",
      value: formatPercentage(riskExposure),
      change: "2.5%",
      icon: "fas fa-shield-alt",
      color: riskExposure > 5 ? "trading-error" : "trading-success",
      bgColor: riskExposure > 5 ? "bg-red-500/20" : "bg-green-500/20",
      subtitle: "Current Drawdown",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="trading-surface rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
              <i className={`${metric.icon} text-${metric.color} text-xl`}></i>
            </div>
            <span className={`text-${metric.color} text-sm font-medium`}>
              {metric.change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
          <p className="text-trading-muted text-sm">
            {metric.subtitle || metric.title}
          </p>
        </div>
      ))}
    </div>
  );
}
