import { Badge } from "@/components/ui/badge";

interface SystemStatusProps {
  status?: Array<{
    id: number;
    component: string;
    status: string;
    message?: string;
    metrics?: any;
    lastUpdated?: string;
  }>;
}

export default function SystemStatus({ status = [] }: SystemStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-trading-success';
      case 'WARNING': return 'bg-trading-warning';
      case 'ERROR': return 'bg-trading-error';
      case 'INACTIVE': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-trading-success';
      case 'WARNING': return 'bg-trading-warning';
      case 'ERROR': return 'bg-trading-error';
      case 'INACTIVE': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-trading-success';
      case 'WARNING': return 'text-trading-warning';
      case 'ERROR': return 'text-trading-error';
      case 'INACTIVE': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Group status items by category
  const apiConnections = status.filter(s => s.component.includes('api'));
  const aiModels = status.filter(s => s.component.includes('model'));
  const systemResources = status.filter(s => s.component.includes('resources'));

  const formatComponentName = (component: string) => {
    return component.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderProgressBar = (value: number, max: number = 100, colorClass: string) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="trading-surface rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">System Status</h3>
      
      <div className="space-y-6">
        {/* API Connections Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-trading-muted">API Connections</span>
            <span className="text-trading-success text-sm">
              {apiConnections.filter(api => api.status === 'ACTIVE').length}/{apiConnections.length} Active
            </span>
          </div>
          <div className="space-y-2">
            {apiConnections.length === 0 ? (
              <div className="text-trading-muted text-sm">No API connections configured</div>
            ) : (
              apiConnections.map((api) => (
                <div key={api.id} className="flex items-center justify-between">
                  <span className="text-white text-sm">{formatComponentName(api.component)}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusDotColor(api.status)}`}></div>
                    <span className={`text-xs ${getStatusText(api.status)}`}>
                      {api.message || api.status}
                    </span>
                    {api.metrics?.latency && (
                      <span className="text-xs text-trading-muted">
                        {api.metrics.latency}ms
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Models Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-trading-muted">AI Models</span>
            <span className="text-trading-success text-sm">
              {aiModels.filter(model => model.status === 'ACTIVE').length}/{aiModels.length} Running
            </span>
          </div>
          <div className="space-y-2">
            {aiModels.length === 0 ? (
              <div className="text-trading-muted text-sm">No AI models configured</div>
            ) : (
              aiModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between">
                  <span className="text-white text-sm">{formatComponentName(model.component)}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${getStatusText(model.status)}`}>
                      {model.status}
                    </span>
                    {model.metrics?.accuracy && (
                      <span className="text-xs text-trading-success">
                        {model.metrics.accuracy}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Resources Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-trading-muted">Resource Usage</span>
            <span className="text-trading-success text-sm">Normal</span>
          </div>
          <div className="space-y-3">
            {systemResources.length > 0 && systemResources[0].metrics && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">CPU</span>
                    <span className="text-trading-muted text-xs">
                      {systemResources[0].metrics.cpu || 0}%
                    </span>
                  </div>
                  {renderProgressBar(
                    systemResources[0].metrics.cpu || 0, 
                    100, 
                    systemResources[0].metrics.cpu > 80 ? 'bg-trading-error' : 
                    systemResources[0].metrics.cpu > 60 ? 'bg-trading-warning' : 'bg-trading-success'
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">Memory</span>
                    <span className="text-trading-muted text-xs">
                      {systemResources[0].metrics.memory || 0}%
                    </span>
                  </div>
                  {renderProgressBar(
                    systemResources[0].metrics.memory || 0, 
                    100, 
                    systemResources[0].metrics.memory > 80 ? 'bg-trading-error' : 
                    systemResources[0].metrics.memory > 60 ? 'bg-trading-warning' : 'bg-trading-success'
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Model Update Information */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Last Model Update</h4>
          <p className="text-trading-muted text-sm">2 hours ago</p>
          <p className="text-trading-success text-xs">Next retraining in 6 hours</p>
        </div>
      </div>
    </div>
  );
}
