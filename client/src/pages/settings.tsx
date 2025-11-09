import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Database, 
  Wifi, 
  Shield, 
  Palette, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Save
} from "lucide-react";

export default function Settings() {
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const { isConnected } = useWebSocket();
  const { toast } = useToast();

  // General Settings
  const [systemName, setSystemName] = useState("EcoTide");
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");

  // Alert Thresholds
  const [phMin, setPhMin] = useState("6.5");
  const [phMax, setPhMax] = useState("8.5");
  const [tempMin, setTempMin] = useState("15");
  const [tempMax, setTempMax] = useState("25");
  const [oxygenMin, setOxygenMin] = useState("6");
  const [turbidityMax, setTurbidityMax] = useState("5");

  // Data Retention
  const [dataRetention, setDataRetention] = useState("365");
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [compressionEnabled, setCompressionEnabled] = useState(true);

  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleString());
  }, []);

  const handleSaveSettings = (section: string) => {
    // Mock save functionality
    console.log(`Saving ${section} settings...`);
    toast({
      title: "Settings saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const handleTestConnection = () => {
    toast({
      title: "Connection test",
      description: "Testing database connection... This would verify connectivity in a real implementation.",
    });
  };

  const handleExportSettings = () => {
    toast({
      title: "Export initiated",
      description: "Settings export would be generated and downloaded in a real implementation.",
    });
  };

  const handleImportSettings = () => {
    toast({
      title: "Import ready",
      description: "File import dialog would open in a real implementation.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header lastUpdateTime={lastUpdateTime} isConnected={isConnected} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Configure system preferences and monitoring parameters</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alert Thresholds
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Management
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>Basic system settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">System Name</Label>
                      <Input
                        id="systemName"
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="EcoTide"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                      <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                          <SelectItem value="300">5 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Refresh</Label>
                        <p className="text-sm text-gray-600">Automatically refresh data at specified intervals</p>
                      </div>
                      <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-gray-600">Enable dark theme for the interface</p>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("General")}>
                      <Save className="h-4 w-4 mr-2" />
                      Save General Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Connection Status
                  </CardTitle>
                  <CardDescription>Monitor system connectivity and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium">WebSocket</p>
                        <p className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium">Database</p>
                        <p className="text-sm text-gray-600">Connected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium">API Server</p>
                        <p className="text-sm text-gray-600">Online</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Configure how and when you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive alerts via email</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                      </div>
                      <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>High Priority Only</Label>
                        <p className="text-sm text-gray-600">Only receive high priority alerts</p>
                      </div>
                      <Switch checked={highPriorityOnly} onCheckedChange={setHighPriorityOnly} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="notificationEmail">Email Address</Label>
                      <Input
                        id="notificationEmail"
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        placeholder="alerts@example.com"
                        disabled={!emailNotifications}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notificationPhone">Phone Number</Label>
                      <Input
                        id="notificationPhone"
                        value={notificationPhone}
                        onChange={(e) => setNotificationPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        disabled={!smsNotifications}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("Notification")}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alert Thresholds */}
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alert Thresholds
                  </CardTitle>
                  <CardDescription>Configure when alerts are triggered based on sensor readings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-medium">pH Level Thresholds</h4>
                      <div className="grid gap-3 grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phMin">Minimum pH</Label>
                          <Input
                            id="phMin"
                            type="number"
                            step="0.1"
                            value={phMin}
                            onChange={(e) => setPhMin(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phMax">Maximum pH</Label>
                          <Input
                            id="phMax"
                            type="number"
                            step="0.1"
                            value={phMax}
                            onChange={(e) => setPhMax(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Temperature Thresholds (°C)</h4>
                      <div className="grid gap-3 grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="tempMin">Minimum Temperature</Label>
                          <Input
                            id="tempMin"
                            type="number"
                            value={tempMin}
                            onChange={(e) => setTempMin(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tempMax">Maximum Temperature</Label>
                          <Input
                            id="tempMax"
                            type="number"
                            value={tempMax}
                            onChange={(e) => setTempMax(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Dissolved Oxygen (mg/L)</h4>
                      <div className="space-y-2">
                        <Label htmlFor="oxygenMin">Minimum Oxygen Level</Label>
                        <Input
                          id="oxygenMin"
                          type="number"
                          step="0.1"
                          value={oxygenMin}
                          onChange={(e) => setOxygenMin(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Turbidity (NTU)</h4>
                      <div className="space-y-2">
                        <Label htmlFor="turbidityMax">Maximum Turbidity</Label>
                        <Input
                          id="turbidityMax"
                          type="number"
                          step="0.1"
                          value={turbidityMax}
                          onChange={(e) => setTurbidityMax(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("Alert Threshold")}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Alert Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Configure data retention and backup settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Data Retention (days)</Label>
                      <Select value={dataRetention} onValueChange={setDataRetention}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="730">2 years</SelectItem>
                          <SelectItem value="-1">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Compression</Label>
                      <p className="text-sm text-gray-600">Compress stored data to save space</p>
                    </div>
                    <Switch checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleTestConnection} variant="outline">
                      Test Database Connection
                    </Button>
                    <Button onClick={() => handleSaveSettings("Data Management")}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Data Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Backup
                  </CardTitle>
                  <CardDescription>Manage system security and configuration backup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Export Configuration</h4>
                        <p className="text-sm text-gray-600">Download current system settings</p>
                      </div>
                      <Button onClick={handleExportSettings} variant="outline">
                        Export Settings
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Import Configuration</h4>
                        <p className="text-sm text-gray-600">Upload and apply saved settings</p>
                      </div>
                      <Button onClick={handleImportSettings} variant="outline">
                        Import Settings
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">System Status</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">SSL Certificate</p>
                          <p className="text-sm text-gray-600">Valid until Dec 2025</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Database Encryption</p>
                          <p className="text-sm text-gray-600">AES-256 enabled</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}