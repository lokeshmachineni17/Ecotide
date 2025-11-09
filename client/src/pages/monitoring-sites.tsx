import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MonitoringSite, SensorReading } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer, Droplets, Activity, Beaker, Map } from "lucide-react";
import InteractiveMap from "@/components/map/interactive-map";
import { useLocation } from "wouter";

export default function MonitoringSites() {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [showMap, setShowMap] = useState(true);
  const { isConnected } = useWebSocket();
  const [, navigate] = useLocation();
  
  const { data: sites, isLoading } = useQuery<MonitoringSite[]>({
    queryKey: ["/api/sites"],
  });

  const handleSiteClick = (site: MonitoringSite) => {
    navigate(`/site/${site.id}`);
  };

  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleString());
  }, []);

  const getSiteStatus = (healthScore: number | null) => {
    if (!healthScore) return { label: "Unknown", variant: "outline" as const, color: "text-gray-600" };
    if (healthScore >= 80) return { label: "Excellent", variant: "default" as const, color: "text-green-600" };
    if (healthScore >= 60) return { label: "Good", variant: "secondary" as const, color: "text-blue-600" };
    if (healthScore >= 40) return { label: "Fair", variant: "outline" as const, color: "text-yellow-600" };
    return { label: "Poor", variant: "destructive" as const, color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header lastUpdateTime={lastUpdateTime} isConnected={isConnected} />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header lastUpdateTime={lastUpdateTime} isConnected={isConnected} />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitoring Sites</h1>
                <p className="text-gray-600">Overview of all water quality monitoring stations</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMap(true)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    showMap ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Map className="h-4 w-4" />
                  Map View
                </button>
                <button
                  onClick={() => setShowMap(false)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    !showMap ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  List View
                </button>
              </div>
            </div>
          </div>

          {showMap && sites && sites.length > 0 && (
            <div className="mb-8">
              <InteractiveMap sites={sites} onSiteClick={handleSiteClick} />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sites?.map((site) => {
              const status = getSiteStatus(site.healthScore);
              return (
                <Card key={site.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1">{site.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {site.location}
                        </CardDescription>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Health Score</span>
                        <span className={`text-2xl font-bold ${status.color}`}>
                          {site.healthScore || 0}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Activity className="h-4 w-4" />
                            Status
                          </span>
                          <span className={`font-medium ${site.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                            {site.status === 'online' ? 'Active' : site.status === 'offline' ? 'Inactive' : 'Maintenance'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Beaker className="h-4 w-4" />
                            Last Update
                          </span>
                          <span className="font-medium">
                            {site.lastUpdate ? new Date(site.lastUpdate).toLocaleDateString() : 'No data'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!sites?.length && !isLoading && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No monitoring sites found</h3>
              <p className="text-gray-600">There are currently no monitoring sites configured.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}