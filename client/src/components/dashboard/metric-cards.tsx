interface MetricCardsProps {
  overallHealth: number;
  activeAlerts: number;
  highPriorityAlerts: number;
  monitoringSites: number;
  onlineSites: number;
  dataPoints: number;
}

export default function MetricCards({
  overallHealth,
  activeAlerts,
  highPriorityAlerts,
  monitoringSites,
  onlineSites,
  dataPoints
}: MetricCardsProps) {
  const formatDataPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
    return points.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Overall Health</h3>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-heart text-green-600 text-xl"></i>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">{overallHealth}%</div>
        <div className="flex items-center text-sm text-green-600">
          <i className="fas fa-arrow-up mr-1"></i>
          <span>System monitoring active</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Active Alerts</h3>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
        </div>
        <div className="text-3xl font-bold text-red-600 mb-2">{activeAlerts}</div>
        <div className="text-sm text-slate-600">{highPriorityAlerts} High Priority</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Monitoring Sites</h3>
          <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
            <i className="fas fa-map-marker-alt text-blue-500 text-xl"></i>
          </div>
        </div>
        <div className="text-3xl font-bold text-blue-500 mb-2">{monitoringSites}</div>
        <div className="text-sm text-slate-600">{onlineSites} Online, {monitoringSites - onlineSites} Offline</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Data Points</h3>
          <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
            <i className="fas fa-database text-green-500 text-xl"></i>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-500 mb-2">{formatDataPoints(dataPoints)}</div>
        <div className="text-sm text-slate-600">Real-time monitoring</div>
      </div>
    </div>
  );
}
