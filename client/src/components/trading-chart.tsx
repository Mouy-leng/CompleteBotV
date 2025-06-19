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

  const { data: marketData } = useQuery({
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
    support: 1.0850,
    resistance: 1.0920,
    rsi: 65.4,
    atr: 0.0045,
  };

  return (
    <div className="trading-surface rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Live Market Analysis</h3>
        <div className="flex items-center space-x-4">
          <select 
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-trading-primary focus:outline-none"
          >
            {symbols.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex bg-gray-700 rounded-lg p-1">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-sm rounded ${
                  timeframe === tf 
                    ? 'bg-trading-primary text-white' 
                    : 'text-trading-muted hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-80 chart-container rounded-lg flex items-center justify-center">
        <canvas ref={chartRef} className="w-full h-full"></canvas>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-trading-muted text-sm">Support</p>
          <p className="text-white font-semibold">{indicators.support?.toFixed(4) || 'N/A'}</p>
        </div>
        <div className="text-center">
          <p className="text-trading-muted text-sm">Resistance</p>
          <p className="text-white font-semibold">{indicators.resistance?.toFixed(4) || 'N/A'}</p>
        </div>
        <div className="text-center">
          <p className="text-trading-muted text-sm">RSI</p>
          <p className="text-white font-semibold">{indicators.rsi?.toFixed(1) || 'N/A'}</p>
        </div>
        <div className="text-center">
          <p className="text-trading-muted text-sm">ATR</p>
          <p className="text-white font-semibold">{indicators.atr?.toFixed(4) || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
