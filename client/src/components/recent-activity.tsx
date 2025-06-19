import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  activities?: Array<{
    id: number;
    userId?: number;
    type: string;
    title: string;
    description?: string;
    severity: string;
    metadata?: any;
    createdAt?: string;
  }>;
}

export default function RecentActivity({ activities = [] }: RecentActivityProps) {
  const getActivityIcon = (type: string, severity: string) => {
    switch (type) {
      case 'TRADE_EXECUTED':
        return { icon: 'fas fa-check', color: 'trading-success' };
      case 'TRADE_CLOSED':
        return { icon: 'fas fa-times', color: severity === 'SUCCESS' ? 'trading-success' : 'trading-error' };
      case 'RISK_ALERT':
        return { icon: 'fas fa-exclamation-triangle', color: 'trading-warning' };
      case 'MODEL_UPDATE':
      case 'MODEL_RETRAINED':
        return { icon: 'fas fa-brain', color: 'trading-primary' };
      case 'AI_SIGNAL_GENERATED':
        return { icon: 'fas fa-robot', color: 'trading-primary' };
      case 'SYSTEM_ERROR':
        return { icon: 'fas fa-exclamation-circle', color: 'trading-error' };
      default:
        return { icon: 'fas fa-info-circle', color: 'trading-muted' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SUCCESS': return 'text-trading-success';
      case 'WARNING': return 'text-trading-warning';
      case 'ERROR': return 'text-trading-error';
      case 'INFO': return 'text-trading-muted';
      default: return 'text-trading-muted';
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const formatActivityTitle = (activity: any) => {
    // Enhanced title formatting based on metadata
    if (activity.type === 'TRADE_EXECUTED' && activity.metadata) {
      return `Trade Executed: ${activity.metadata.symbol} ${activity.metadata.type}`;
    }
    return activity.title;
  };

  const formatActivityDescription = (activity: any) => {
    if (activity.type === 'TRADE_EXECUTED' && activity.metadata) {
      const { price, quantity, symbol } = activity.metadata;
      return `Entry at ${price} | Size: ${quantity} lot${parseFloat(quantity) !== 1 ? 's' : ''} | ${symbol}`;
    }
    return activity.description || 'No additional details';
  };

  return (
    <div className="trading-surface rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Activity & Alerts</h3>
        <div className="flex items-center space-x-2">
          <button className="text-trading-muted hover:text-white transition-colors p-2 rounded">
            <i className="fas fa-filter"></i>
          </button>
          <button className="text-trading-muted hover:text-white transition-colors p-2 rounded">
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-history text-4xl text-trading-muted mb-4"></i>
            <p className="text-trading-muted">No recent activity</p>
            <p className="text-sm text-trading-muted">System activities will appear here</p>
          </div>
        ) : (
          activities.map((activity) => {
            const { icon, color } = getActivityIcon(activity.type, activity.severity);
            
            return (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className={`w-10 h-10 bg-${color}/20 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <i className={`${icon} text-${color}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium mb-1 truncate">
                    {formatActivityTitle(activity)}
                  </p>
                  <p className="text-trading-muted text-sm mb-2 line-clamp-2">
                    {formatActivityDescription(activity)}
                  </p>
                  
                  {/* Additional metadata display */}
                  {activity.metadata && (
                    <div className="text-xs text-trading-muted space-y-1">
                      {activity.type === 'MODEL_RETRAINED' && activity.metadata.oldAccuracy && (
                        <div>
                          Accuracy: {activity.metadata.oldAccuracy}% → {activity.metadata.newAccuracy}%
                          {activity.metadata.improvement > 0 && (
                            <span className="text-trading-success ml-1">
                              (+{activity.metadata.improvement.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      )}
                      
                      {activity.type === 'RISK_ALERT' && activity.metadata.exposure && (
                        <div>
                          Risk: {activity.metadata.exposure}% / {activity.metadata.limit}%
                        </div>
                      )}
                      
                      {activity.type === 'AI_SIGNAL_GENERATED' && activity.metadata.confidence && (
                        <div>
                          Signal: {activity.metadata.signal} | Confidence: {activity.metadata.confidence}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-trading-muted text-xs">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                  {activity.severity !== 'INFO' && (
                    <span className={`text-xs font-medium mt-1 ${getSeverityColor(activity.severity)}`}>
                      {activity.severity}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button className="w-full text-trading-primary hover:text-blue-400 text-sm font-medium transition-colors">
            View All Activities
          </button>
        </div>
      )}
    </div>
  );
}
