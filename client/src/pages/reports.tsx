import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MonitoringSite, SensorReading, Alert } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Filter, TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Reports() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("summary");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const { isConnected } = useWebSocket();

  const { data: sites, isLoading: sitesLoading } = useQuery<MonitoringSite[]>({
    queryKey: ["/api/sites"],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleString());
  }, []);

  // Generate mock data for demonstration
  const generateReportData = () => {
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
        alerts: Math.floor(Math.random() * 5),
      };
    });
  };

  const reportData = generateReportData();

  const alertDistribution = [
    { name: "High Priority", value: alerts?.filter(a => a.priority === "high").length || 0, color: "#ef4444" },
    { name: "Medium Priority", value: alerts?.filter(a => a.priority === "medium").length || 0, color: "#f59e0b" },
    { name: "Low Priority", value: alerts?.filter(a => a.priority === "low").length || 0, color: "#eab308" },
  ];

  const siteHealthData = sites?.map(site => ({
    name: site.name.split(' ').slice(0, 2).join(' '), // Shorten names
    health: site.healthScore || 0,
    status: site.status,
  })) || [];

  const calculateAverage = (data: any[], key: string) => {
    const sum = data.reduce((acc, item) => acc + item[key], 0);
    return (sum / data.length).toFixed(1);
  };

  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-7).reduce((sum, item) => sum + item[key], 0) / 7;
    const earlier = data.slice(0, 7).reduce((sum, item) => sum + item[key], 0) / 7;
    return ((recent - earlier) / earlier) * 100;
  };

  const handleExportReport = () => {
    // Mock export functionality
    console.log("Exporting report...", { selectedSite, reportType, timeRange });
    // In a real app, this would generate and download a PDF/CSV file
    alert("Report export feature would be implemented here. This would generate a PDF or CSV file with the selected data.");
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 2) return "text-green-600";
    if (trend < -2) return "text-red-600";
    return "text-gray-600";
  };

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
                <div className="h-32 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600">Generate and export comprehensive water quality reports</p>
          </div>

          {/* Report Configuration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>Configure your report parameters and export options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monitoring Site</label>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites?.map((site) => (
                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="alerts">Alert History</SelectItem>
                      <SelectItem value="trends">Trend Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleExportReport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg pH Level</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateAverage(reportData, "ph")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(calculateTrend(reportData, "ph"))}
                    <span className={`text-sm ${getTrendColor(calculateTrend(reportData, "ph"))}`}>
                      {Math.abs(calculateTrend(reportData, "ph")).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Temperature</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateAverage(reportData, "temperature")}°C</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(calculateTrend(reportData, "temperature"))}
                    <span className={`text-sm ${getTrendColor(calculateTrend(reportData, "temperature"))}`}>
                      {Math.abs(calculateTrend(reportData, "temperature")).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Dissolved O₂</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateAverage(reportData, "dissolvedOxygen")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(calculateTrend(reportData, "dissolvedOxygen"))}
                    <span className={`text-sm ${getTrendColor(calculateTrend(reportData, "dissolvedOxygen"))}`}>
                      {Math.abs(calculateTrend(reportData, "dissolvedOxygen")).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{alerts?.length || 0}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">This period</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Water Quality Trends</CardTitle>
                <CardDescription>pH and temperature variations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
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
                <CardTitle>Alert Distribution</CardTitle>
                <CardDescription>Breakdown of alerts by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {alertDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Site Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Site Health Overview</CardTitle>
              <CardDescription>Health scores and status for all monitoring sites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {siteHealthData.map((site, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{site.name}</div>
                      <Badge variant={site.status === "online" ? "default" : "destructive"}>
                        {site.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Health Score</div>
                        <div className={`text-lg font-bold ${
                          site.health >= 80 ? "text-green-600" : 
                          site.health >= 60 ? "text-blue-600" : 
                          site.health >= 40 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {site.health}%
                        </div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            site.health >= 80 ? "bg-green-500" : 
                            site.health >= 60 ? "bg-blue-500" : 
                            site.health >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${site.health}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}