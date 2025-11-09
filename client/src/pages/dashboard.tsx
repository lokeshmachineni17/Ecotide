import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { MonitoringSite, SensorReading, Alert } from "@shared/schema";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import MetricCards from "@/components/dashboard/metric-cards";
import HealthScore from "@/components/dashboard/health-score";
import Charts from "@/components/dashboard/charts";
import Alerts from "@/components/dashboard/alerts";
import MonitoringLocations from "@/components/dashboard/monitoring-locations";

export default function Dashboard() {
  const [sites, setSites] = useState<MonitoringSite[]>([]);
  const [latestReadings, setLatestReadings] = useState<Record<string, SensorReading>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");

  const { isConnected, lastMessage } = useWebSocket();

  // Fetch initial data
  const { data: initialSites } = useQuery<MonitoringSite[]>({
    queryKey: ["/api/sites"],
  });

  const { data: initialAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Initialize data
  useEffect(() => {
    if (initialSites) {
      setSites(initialSites);
      // Fetch latest readings for each site
      initialSites.forEach(async (site) => {
        try {
          const response = await fetch(`/api/sites/${site.id}/latest-reading`);
          if (response.ok) {
            const reading = await response.json();
            if (reading) {
              setLatestReadings(prev => ({
                ...prev,
                [site.id]: reading,
              }));
            }
          }
        } catch (error) {
          console.error(`Failed to fetch latest reading for site ${site.id}:`, error);
        }
      });
    }
  }, [initialSites]);

  useEffect(() => {
    if (initialAlerts) {
      setAlerts(initialAlerts);
    }
  }, [initialAlerts]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      setLastUpdateTime(new Date().toLocaleString());
      
      switch (lastMessage.type) {
        case "sensor_update":
          setLatestReadings(prev => ({
            ...prev,
            [lastMessage.data.siteId]: {
              id: `${lastMessage.data.siteId}-latest`,
              siteId: lastMessage.data.siteId,
              timestamp: new Date(),
              phLevel: lastMessage.data.readings.phLevel || null,
              temperature: lastMessage.data.readings.temperature || null,
              dissolvedOxygen: lastMessage.data.readings.dissolvedOxygen || null,
              nitrates: lastMessage.data.readings.nitrates || null,
              turbidity: lastMessage.data.readings.turbidity || null,
            },
          }));
          break;
          
        case "site_status_update":
          setSites(prev => prev.map(site => 
            site.id === lastMessage.data.siteId
              ? { ...site, status: lastMessage.data.status, healthScore: lastMessage.data.healthScore }
              : site
          ));
          break;
          
        case "alert_created":
          setAlerts(prev => [{
            ...lastMessage.data,
            confidence: lastMessage.data.confidence || null,
            eta: lastMessage.data.eta || null,
            isActive: lastMessage.data.isActive !== undefined ? lastMessage.data.isActive : true,
            createdAt: new Date(),
          }, ...prev]);
          break;
      }
    }
  }, [lastMessage]);

  // Calculate overall metrics
  const onlineSites = sites.filter(site => site.status === "online");
  const overallHealth = Math.round(
    sites.reduce((sum, site) => sum + (site.healthScore || 0), 0) / sites.length || 0
  );
  const activeAlertCount = alerts.filter(alert => alert.isActive).length;
  const highPriorityAlerts = alerts.filter(alert => alert.isActive && alert.priority === "high").length;

  // Get aggregated sensor data for display
  const aggregatedReadings = Object.values(latestReadings);
  const avgPh = aggregatedReadings.length > 0 
    ? aggregatedReadings.reduce((sum, r) => sum + (r.phLevel || 0), 0) / aggregatedReadings.length 
    : 0;
  const avgTemp = aggregatedReadings.length > 0
    ? aggregatedReadings.reduce((sum, r) => sum + (r.temperature || 0), 0) / aggregatedReadings.length
    : 0;
  const avgDO = aggregatedReadings.length > 0
    ? aggregatedReadings.reduce((sum, r) => sum + (r.dissolvedOxygen || 0), 0) / aggregatedReadings.length
    : 0;
  const avgNitrates = aggregatedReadings.length > 0
    ? aggregatedReadings.reduce((sum, r) => sum + (r.nitrates || 0), 0) / aggregatedReadings.length
    : 0;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header 
          lastUpdateTime={lastUpdateTime}
          isConnected={isConnected}
        />
        
        <main className="p-6 overflow-y-auto h-full space-y-8">
          <MetricCards
            overallHealth={overallHealth}
            activeAlerts={activeAlertCount}
            highPriorityAlerts={highPriorityAlerts}
            monitoringSites={sites.length}
            onlineSites={onlineSites.length}
            dataPoints={aggregatedReadings.length * 1000} // Simulated total data points
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Live Sensor Data</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-slate-500">
                    {isConnected ? 'Updating every 30s' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 font-medium">pH Level</span>
                    <i className="fas fa-flask text-blue-600"></i>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{avgPh.toFixed(1)}</div>
                  <div className="text-sm text-green-600">
                    {avgPh >= 6.5 && avgPh <= 8.5 ? 'Optimal Range' : 'Outside Range'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 font-medium">Temperature</span>
                    <i className="fas fa-thermometer-half text-red-600"></i>
                  </div>
                  <div className="text-2xl font-bold text-red-700">{avgTemp.toFixed(1)}°C</div>
                  <div className="text-sm text-green-600">
                    {avgTemp >= 10 && avgTemp <= 25 ? 'Normal' : 'Abnormal'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 font-medium">Dissolved O₂</span>
                    <i className="fas fa-lungs text-green-600"></i>
                  </div>
                  <div className="text-2xl font-bold text-green-700">{avgDO.toFixed(1)} mg/L</div>
                  <div className="text-sm text-green-600">
                    {avgDO >= 6 ? 'Healthy' : 'Low'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 font-medium">Nitrates</span>
                    <i className="fas fa-atom text-amber-600"></i>
                  </div>
                  <div className="text-2xl font-bold text-amber-700">{avgNitrates.toFixed(1)} ppm</div>
                  <div className="text-sm text-amber-600">
                    {avgNitrates <= 3 ? 'Moderate' : 'High'}
                  </div>
                </div>
              </div>
            </div>

            <HealthScore healthScore={overallHealth} />
          </div>

          <Charts sites={sites} />

          <Alerts alerts={alerts.filter(alert => alert.isActive)} sites={sites} />

          <MonitoringLocations sites={sites} />
        </main>
      </div>
    </div>
  );
}
