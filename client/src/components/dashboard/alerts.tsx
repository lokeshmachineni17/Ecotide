import { Alert, MonitoringSite } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AlertsProps {
  alerts: Alert[];
  sites: MonitoringSite[];
}

export default function Alerts({ alerts, sites }: AlertsProps) {
  const queryClient = useQueryClient();

  const dismissMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("POST", `/api/alerts/${alertId}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site?.name || "Unknown Site";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-200 bg-red-50";
      case "medium": return "border-amber-200 bg-amber-50";
      case "low": return "border-blue-200 bg-blue-50";
      default: return "border-slate-200 bg-slate-50";
    }
  };

  const getPriorityIconColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-amber-500 text-white";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-800";
      case "medium": return "text-amber-800";
      case "low": return "text-blue-800";
      default: return "text-slate-800";
    }
  };

  const getPriorityDescriptionColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-700";
      case "medium": return "text-amber-700";
      case "low": return "text-blue-700";
      default: return "text-slate-700";
    }
  };

  const getPriorityDetailColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-amber-600";
      case "low": return "text-blue-600";
      default: return "text-slate-600";
    }
  };

  const getPriorityCloseColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 hover:text-red-800";
      case "medium": return "text-amber-600 hover:text-amber-800";
      case "low": return "text-blue-600 hover:text-blue-800";
      default: return "text-slate-600 hover:text-slate-800";
    }
  };

  const handleDismiss = (alertId: string) => {
    dismissMutation.mutate(alertId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-800">Predictive Alerts & Recommendations</h3>
        <button className="text-blue-500 hover:text-blue-600 font-medium">View All Alerts</button>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <i className="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
            <p className="font-medium">No active alerts</p>
            <p className="text-sm">All systems are operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`flex items-start space-x-4 p-4 border rounded-lg ${getPriorityColor(alert.priority)}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getPriorityIconColor(alert.priority)}`}>
                <i className={`fas ${alert.alertType === 'prediction' ? 'fa-exclamation' : alert.alertType === 'anomaly' ? 'fa-exclamation-triangle' : 'fa-info'} text-sm`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${getPriorityTextColor(alert.priority)}`}>{alert.title}</h4>
                  <span className={`text-sm font-medium ${getPriorityDetailColor(alert.priority)} capitalize`}>
                    {alert.priority} Priority
                  </span>
                </div>
                <p className={`mb-2 ${getPriorityDescriptionColor(alert.priority)}`}>{alert.description}</p>
                <div className={`flex items-center space-x-4 text-sm ${getPriorityDetailColor(alert.priority)}`}>
                  <span>Location: <span className="font-medium">{getSiteName(alert.siteId)}</span></span>
                  {alert.confidence && (
                    <span>Confidence: <span className="font-medium">{alert.confidence}%</span></span>
                  )}
                  {alert.eta && (
                    <span>ETA: <span className="font-medium">{alert.eta}</span></span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={getPriorityCloseColor(alert.priority)}
                onClick={() => handleDismiss(alert.id)}
                disabled={dismissMutation.isPending}
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
