import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Alert, MonitoringSite } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, CheckCircle, Filter, MapPin, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const { isConnected } = useWebSocket();
  const { toast } = useToast();

  const { data: alerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: sites } = useQuery<MonitoringSite[]>({
    queryKey: ["/api/sites"],
  });

  const dismissAlertMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("POST", `/api/alerts/${alertId}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert dismissed",
        description: "The alert has been successfully dismissed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to dismiss alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleString());
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-orange-600 bg-orange-50 border-orange-200";
      case "low": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "medium": return <Clock className="h-5 w-5 text-orange-600" />;
      case "low": return <TrendingUp className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prediction": return "text-blue-600 bg-blue-50";
      case "anomaly": return "text-purple-600 bg-purple-50";
      case "maintenance": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getSiteName = (siteId: string) => {
    return sites?.find(site => site.id === siteId)?.name || "Unknown Site";
  };

  const getSiteLocation = (siteId: string) => {
    return sites?.find(site => site.id === siteId)?.location || "Unknown Location";
  };

  const filteredAlerts = alerts?.filter(alert => {
    const priorityMatch = filterPriority === "all" || alert.priority === filterPriority;
    const typeMatch = filterType === "all" || alert.alertType === filterType;
    return priorityMatch && typeMatch && alert.isActive;
  }) || [];

  const handleDismissAlert = (alertId: string) => {
    dismissAlertMutation.mutate(alertId);
  };

  if (alertsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header lastUpdateTime={lastUpdateTime} isConnected={isConnected} />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
        <main className="flex-1 p-8 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts</h1>
            <p className="text-gray-600">Monitor and manage water quality alerts</p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Filter by:</span>
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="prediction">Predictions</SelectItem>
                <SelectItem value="anomaly">Anomalies</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts?.filter(a => a.priority === "high" && a.isActive).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts?.filter(a => a.priority === "medium" && a.isActive).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Priority</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts?.filter(a => a.priority === "low" && a.isActive).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {alerts?.filter(a => a.isActive).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getPriorityColor(alert.priority)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getPriorityIcon(alert.priority)}
                      <div>
                        <CardTitle className="text-lg mb-1">{alert.title}</CardTitle>
                        <CardDescription>{alert.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(alert.alertType)}>
                        {alert.alertType}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(alert.priority).replace('bg-', 'bg-').replace('border-', '')}>
                        {alert.priority} priority
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Site
                      </p>
                      <p className="font-medium">{getSiteName(alert.siteId)}</p>
                      <p className="text-sm text-gray-500">{getSiteLocation(alert.siteId)}</p>
                    </div>

                    {alert.confidence && (
                      <div>
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className="font-medium">{(alert.confidence * 100).toFixed(0)}%</p>
                      </div>
                    )}

                    {alert.eta && (
                      <div>
                        <p className="text-sm text-gray-600">ETA</p>
                        <p className="font-medium">{alert.eta}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {new Date(alert.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissAlert(alert.id)}
                      disabled={dismissAlertMutation.isPending}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {dismissAlertMutation.isPending ? "Dismissing..." : "Dismiss Alert"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlerts.length === 0 && !alertsLoading && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active alerts</h3>
              <p className="text-gray-600">All systems are running normally.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}