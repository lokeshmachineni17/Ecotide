import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MonitoringSite } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartsProps {
  sites: MonitoringSite[];
}

export default function Charts({ sites }: ChartsProps) {
  const [phData, setPhData] = useState<any[]>([]);
  const [tempOxygenData, setTempOxygenData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    // Generate sample historical data for charts
    const generateData = () => {
      const now = new Date();
      const data = [];
      const points = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30;
      
      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * (timeRange === "24h" ? 60 * 60 * 1000 : timeRange === "7d" ? 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
        
        data.push({
          time: timeRange === "24h" ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : timestamp.toLocaleDateString(),
          ph: (7.2 + (Math.random() - 0.5) * 0.6).toFixed(1),
          temperature: (18.5 + (Math.random() - 0.5) * 4).toFixed(1),
          dissolvedOxygen: (8.3 + (Math.random() - 0.5) * 2).toFixed(1),
        });
      }
      
      setPhData(data);
      setTempOxygenData(data);
    };

    generateData();
  }, [timeRange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* pH Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">pH Level Trends</h3>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last Week</SelectItem>
              <SelectItem value="30d">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={phData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                domain={[6.5, 8.0]}
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ph" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature vs Dissolved Oxygen */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Temperature & Dissolved Oxygen</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempOxygenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                yAxisId="temp"
                orientation="left"
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                yAxisId="oxygen"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                yAxisId="temp"
                type="monotone" 
                dataKey="temperature" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Temperature (°C)"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="oxygen"
                type="monotone" 
                dataKey="dissolvedOxygen" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Dissolved O₂ (mg/L)"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
