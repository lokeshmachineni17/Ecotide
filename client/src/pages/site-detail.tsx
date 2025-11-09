import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MonitoringSite, SensorReading } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MapPin, Calendar, Thermometer, Droplets, Beaker, AlertTriangle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "wouter";

interface SiteDetailProps {
  siteId: string;
}

export default function SiteDetail({ siteId }: SiteDetailProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const { isConnected } = useWebSocket();

  const { data: sites } = useQuery<MonitoringSite[]>({
    queryKey: ["/api/sites"],
  });

  const { data: readings, isLoading: readingsLoading } = useQuery<SensorReading[]>({
    queryKey: ["/api/sites", siteId, "readings"],
  });

  const { data: latestReading } = useQuery<SensorReading>({
    queryKey: ["/api/sites", siteId, "latest-reading"],
  });

  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleString());
  }, []);

  const site = sites?.find(s => s.id === siteId);

  const getSiteStatus = (healthScore: number | null) => {
    if (!healthScore) return { label: "Unknown", variant: "outline" as const, color: "text-gray-600" };
    if (healthScore >= 80) return { label: "Excellent", variant: "default" as const, color: "text-green-600" };
    if (healthScore >= 60) return { label: "Good", variant: "secondary" as const, color: "text-blue-600" };
    if (healthScore >= 40) return { label: "Fair", variant: "outline" as const, color: "text-yellow-600" };
    return { label: "Poor", variant: "destructive" as const, color: "text-red-600" };
  };

  const formatValue = (value: number | null, unit: string) => {
    return value !== null ? `${value.toFixed(2)} ${unit}` : "No data";
  };

  const getParameterStatus = (value: number | null, min: number, max: number) => {
    if (value === null) return "text-gray-500";
    if (value >= min && value <= max) return "text-green-600";
    return "text-red-600";
  };

  // Generate chart data from readings
  const chartData = readings?.slice(-20).map(reading => ({
    time: new Date(reading.timestamp || "").toLocaleTimeString(),
    ph: reading.phLevel || 0,
    temperature: reading.temperature || 0,
    dissolvedOxygen: reading.dissolvedOxygen || 0,
    turbidity: reading.turbidity || 0,
  })) || [];

  if (!site) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header lastUpdateTime={lastUpdateTime} isConnected={isConnected} />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Site Not Found</h1>
              <p className="text-gray-600 mb-6">The requested monitoring site could not be found.</p>
              <Link href="/monitoring-sites">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Monitoring Sites
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const status = getSiteStatus(site.healthScore);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header lastUpdateTime={lastUpdateTime} isConnected={isConnected} />
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/monitoring-sites">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {site.location}
                </p>
              </div>
              <Badge variant={status.variant} className="ml-auto">
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Site Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Health Score</p>
                    <p className={`text-2xl font-bold ${status.color}`}>
                      {site.healthScore || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Droplets className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className={`text-lg font-bold ${site.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                      {site.status === 'online' ? 'Active' : site.status === 'offline' ? 'Inactive' : 'Maintenance'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Coordinates</p>
                    <p className="text-sm font-mono">
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Last Update</p>
                    <p className="text-sm">
                      {site.lastUpdate ? new Date(site.lastUpdate).toLocaleDateString() : 'No data'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Reading */}
          {latestReading && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Latest Water Quality Reading</CardTitle>
                <CardDescription>
                  Most recent sensor data from {new Date(latestReading.timestamp || "").toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Beaker className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">pH Level</span>
                    </div>
                    <p className={`text-xl font-bold ${getParameterStatus(latestReading.phLevel, 6.5, 8.5)}`}>
                      {formatValue(latestReading.phLevel, "")}
                    </p>
                    <p className="text-xs text-gray-500">Normal: 6.5 - 8.5</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-600">Temperature</span>
                    </div>
                    <p className={`text-xl font-bold ${getParameterStatus(latestReading.temperature, 15, 25)}`}>
                      {formatValue(latestReading.temperature, "°C")}
                    </p>
                    <p className="text-xs text-gray-500">Normal: 15 - 25°C</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-600">Dissolved Oxygen</span>
                    </div>
                    <p className={`text-xl font-bold ${getParameterStatus(latestReading.dissolvedOxygen, 6, Infinity)}`}>
                      {formatValue(latestReading.dissolvedOxygen, "mg/L")}
                    </p>
                    <p className="text-xs text-gray-500">Normal: &gt; 6 mg/L</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-600">Turbidity</span>
                    </div>
                    <p className={`text-xl font-bold ${getParameterStatus(latestReading.turbidity, 0, 5)}`}>
                      {formatValue(latestReading.turbidity, "NTU")}
                    </p>
                    <p className="text-xs text-gray-500">Normal: &lt; 5 NTU</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>pH and Temperature Trends</CardTitle>
                  <CardDescription>Last 20 readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} name="pH Level" />
                      <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature (°C)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Oxygen and Turbidity</CardTitle>
                  <CardDescription>Last 20 readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="dissolvedOxygen" stroke="#06b6d4" strokeWidth={2} name="Dissolved Oxygen (mg/L)" />
                      <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} name="Turbidity (NTU)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Readings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Readings History</CardTitle>
              <CardDescription>
                Complete time-stamped data from the monitoring station
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : readings && readings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>pH Level</TableHead>
                        <TableHead>Temperature (°C)</TableHead>
                        <TableHead>Dissolved O₂ (mg/L)</TableHead>
                        <TableHead>Turbidity (NTU)</TableHead>
                        <TableHead>Nitrates (mg/L)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readings.slice(0, 20).map((reading) => (
                        <TableRow key={reading.id}>
                          <TableCell className="font-medium">
                            {new Date(reading.timestamp || "").toLocaleString()}
                          </TableCell>
                          <TableCell className={getParameterStatus(reading.phLevel, 6.5, 8.5)}>
                            {reading.phLevel?.toFixed(2) || "—"}
                          </TableCell>
                          <TableCell className={getParameterStatus(reading.temperature, 15, 25)}>
                            {reading.temperature?.toFixed(1) || "—"}
                          </TableCell>
                          <TableCell className={getParameterStatus(reading.dissolvedOxygen, 6, Infinity)}>
                            {reading.dissolvedOxygen?.toFixed(2) || "—"}
                          </TableCell>
                          <TableCell className={getParameterStatus(reading.turbidity, 0, 5)}>
                            {reading.turbidity?.toFixed(2) || "—"}
                          </TableCell>
                          <TableCell>
                            {reading.nitrates?.toFixed(2) || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No readings available for this site</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}