import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MonitoringSite, SensorReading } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Activity, Droplets, Thermometer, Beaker, AlertTriangle } from "lucide-react";

export default function Analytics() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const { isConnected } = useWebSocket();

  const { data: sites, isLoading: sitesLoading } = useQuery<MonitoringSite[]>({
    queryKey: ["/api/sites"],
  });

  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleString());
  }, []);

  // Generate mock trend data for demonstration
  const generateTrendData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toLocaleDateString(),
        ph: 7.2 + Math.random() * 0.8 - 0.4,
        temperature: 22 + Math.random() * 6 - 3,
        dissolvedOxygen: 8.5 + Math.random() * 2 - 1,
        turbidity: 2 + Math.random() * 3,
        nitrates: 0.5 + Math.random() * 1,
      };
    });
  };

  const trendData = generateTrendData();

  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, item) => sum + item[key], 0) / 3;
    const earlier = data.slice(0, 3).reduce((sum, item) => sum + item[key], 0) / 3;
    return ((recent - earlier) / earlier) * 100;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const metrics = [
    {
      name: "pH Level",
      key: "ph",
      value: trendData[trendData.length - 1]?.ph.toFixed(1) || "7.2",
      trend: calculateTrend(trendData, "ph"),
      icon: Beaker,
      color: "#3b82f6",
      ideal: "6.5-8.5",
    },
    {
      name: "Temperature",
      key: "temperature",
      value: `${trendData[trendData.length - 1]?.temperature.toFixed(1) || "22.5"}°C`,
      trend: calculateTrend(trendData, "temperature"),
      icon: Thermometer,
      color: "#ef4444",
      ideal: "15-25°C",
    },
    {
      name: "Dissolved Oxygen",
      key: "dissolvedOxygen",
      value: `${trendData[trendData.length - 1]?.dissolvedOxygen.toFixed(1) || "8.5"} mg/L`,
      trend: calculateTrend(trendData, "dissolvedOxygen"),
      icon: Droplets,
      color: "#06b6d4",
      ideal: ">6 mg/L",
    },
    {
      name: "Turbidity",
      key: "turbidity",
      value: `${trendData[trendData.length - 1]?.turbidity.toFixed(1) || "2.1"} NTU`,
      trend: calculateTrend(trendData, "turbidity"),
      icon: AlertTriangle,
      color: "#f59e0b",
      ideal: "<5 NTU",
    },
  ];

  if (sitesLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header lastUpdateTime={lastUpdateTime} isConnected={isConnected} />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid gap-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
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
        <main className="flex-1 p-8 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Detailed analysis of water quality trends and patterns</p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8">
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select monitoring site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites?.map((site) => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <metric.icon className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-xs ${
                        metric.trend > 2 ? 'text-green-600' : 
                        metric.trend < -2 ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {Math.abs(metric.trend).toFixed(1)}%
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Ideal: {metric.ideal}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>pH Level Trends</CardTitle>
                <CardDescription>pH level variations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[6, 9]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature Trends</CardTitle>
                <CardDescription>Water temperature variations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#ef444420" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dissolved Oxygen</CardTitle>
                <CardDescription>Oxygen levels in water over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="dissolvedOxygen" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Water Quality Distribution</CardTitle>
                <CardDescription>Turbidity and nitrate levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="turbidity" fill="#f59e0b" />
                    <Bar dataKey="nitrates" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}