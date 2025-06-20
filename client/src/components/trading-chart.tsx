import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}

export default function TradingChart({ 
  symbol, 
  timeframe, 
  onSymbolChange, 
  onTimeframeChange 
}: TradingChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<any>(null);

  const { data: marketData } = useQuery<any>({
    queryKey: [`/api/market-data/${symbol}`],
    refetchInterval: 5000,
  });

  const symbols = ["EUR/USD", "GBP/USD", "BTC/USD", "AAPL"];
  const timeframes = ["1H", "4H", "1D"];

  useEffect(() => {
    if (chartRef.current && typeof window !== 'undefined') {
      // Dynamically import Chart.js to avoid SSR issues
      import('chart.js/auto').then((ChartJS) => {
        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart
        if (chart) {
          chart.destroy();
        }

        // Generate sample data for demonstration
        const generateChartData = () => {
          const basePrice = parseFloat(marketData?.price || "1.0890");
          const labels = [];
          const data = [];
          
          for (let i = 23; i >= 0; i--) {
            const time = new Date();
            time.setHours(time.getHours() - i);
            labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            
            // Generate realistic price movement
            const randomChange = (Math.random() - 0.5) * 0.002;
            const price = basePrice + randomChange * (24 - i);
            data.push(price);
          }
          
          return { labels, data };
        };

        const chartData = generateChartData();

        const newChart = new ChartJS.default(ctx, {
          type: 'line',
          data: {
            labels: chartData.labels,
            datasets: [{
              label: symbol,
              data: chartData.data,
              borderColor: 'hsl(210, 83%, 53%)',
              backgroundColor: 'hsla(210, 83%, 53%, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'hsl(240, 3.7%, 25.9%)'
                },
                ticks: {
                  color: 'hsl(240, 5%, 64.9%)'
                }
              },
              y: {
                grid: {
                  color: 'hsl(240, 3.7%, 25.9%)'
                },
                ticks: {
                  color: 'hsl(240, 5%, 64.9%)',
                  callback: function(value) {
                    return typeof value === 'number' ? value.toFixed(5) : value;
                  }
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        });

        setChart(newChart);
      });
    }

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [symbol, marketData]);

  const indicators = marketData?.indicators || {
    support: "1.0850",
    resistance: "1.0920", 
    rsi: "65.4",
    atr: "0.0045",
  };

  return (
    <div className="trading-surface rounded-2xl p-8 trading-glow">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold trading-text mb-2">Live Market Analysis</h3>
          <p className="trading-muted text-sm">Real-time price action with AI predictions</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="bg-trading-surface-light text-trading-text rounded-xl px-4 py-3 text-sm border trading-border focus:border-trading-primary focus:outline-none trading-glow"
          >
            {symbols.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex bg-trading-surface-light rounded-xl p-2 space-x-1">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                  timeframe === tf 
                    ? 'trading-primary-gradient text-white trading-glow' 
                    : 'trading-muted hover:text-trading-text hover:bg-trading-border'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-96 trading-surface-light rounded-2xl p-4 mb-6 relative overflow-hidden">
        <canvas ref={chartRef} className="w-full h-full"></canvas>
        
        {/* Chart overlay indicators */}
        <div className="absolute top-4 left-4 flex space-x-4">
          <div className="bg-trading-surface/80 rounded-lg px-3 py-2 backdrop-blur-sm">
            <span className="text-trading-success text-sm font-medium">
              <i className="fas fa-arrow-up mr-1"></i>
              +0.14%
            </span>
          </div>
          <div className="bg-trading-surface/80 rounded-lg px-3 py-2 backdrop-blur-sm">
            <span className="text-trading-primary text-sm font-medium">
              <i className="fas fa-robot mr-1"></i>
              AI: BUY 87%
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Support", value: typeof indicators.support === 'string' ? indicators.support : indicators.support?.toFixed(5) || 'N/A', color: "text-trading-error" },
          { label: "Resistance", value: typeof indicators.resistance === 'string' ? indicators.resistance : indicators.resistance?.toFixed(5) || 'N/A', color: "text-trading-success" },
          { label: "RSI", value: typeof indicators.rsi === 'string' ? indicators.rsi : indicators.rsi?.toFixed(1) || 'N/A', color: "text-trading-primary" },
          { label: "ATR", value: typeof indicators.atr === 'string' ? indicators.atr : indicators.atr?.toFixed(5) || 'N/A', color: "text-trading-warning" }
        ].map((indicator, index) => (
          <div key={index} className="text-center p-4 rounded-xl bg-trading-surface-light/50">
            <p className="trading-muted text-sm font-medium mb-2">{indicator.label}</p>
            <p className={`text-xl font-bold ${indicator.color}`}>{indicator.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
