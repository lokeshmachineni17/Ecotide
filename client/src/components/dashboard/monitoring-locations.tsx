import { MonitoringSite } from "@shared/schema";

interface MonitoringLocationsProps {
  sites: MonitoringSite[];
}

export default function MonitoringLocations({ sites }: MonitoringLocationsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "offline": return "bg-red-500";
      case "maintenance": return "bg-amber-500";
      default: return "bg-slate-500";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-amber-600";
    return "text-red-600";
  };

  const formatLastUpdate = (site: MonitoringSite) => {
    if (!site.lastUpdate) return "No data";
    const now = new Date();
    const update = new Date(site.lastUpdate);
    const diffMs = now.getTime() - update.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Active Monitoring Locations</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Placeholder */}
        <div className="bg-slate-100 rounded-lg h-80 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <i className="fas fa-map text-4xl mb-4"></i>
            <p className="font-medium">Interactive Map</p>
            <p className="text-sm">Monitoring site locations with real-time status</p>
            <p className="text-xs mt-2">Wagga Wagga Region</p>
          </div>
        </div>

        {/* Site List */}
        <div className="space-y-3">
          {sites.map((site) => (
            <div key={site.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(site.status)}`}></div>
                <div>
                  <h4 className="font-medium text-slate-800">{site.name}</h4>
                  <p className="text-sm text-slate-600">{site.location}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${site.status === 'offline' ? 'text-red-600' : getHealthScoreColor(site.healthScore || 0)}`}>
                  {site.status === 'offline' ? 'Offline' : `${site.healthScore || 0}%`}
                </div>
                <div className="text-xs text-slate-500">{formatLastUpdate(site)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
