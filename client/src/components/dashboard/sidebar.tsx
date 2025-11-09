import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-water text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">EcoTide</h1>
            <p className="text-sm text-slate-500">Aquatic Health Monitor</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span className="font-medium">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/monitoring-sites"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/monitoring-sites" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <i className="fas fa-map-marker-alt"></i>
              <span className="font-medium">Monitoring Sites</span>
            </Link>
          </li>
          <li>
            <Link
              href="/analytics"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/analytics" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <i className="fas fa-chart-line"></i>
              <span className="font-medium">Analytics</span>
            </Link>
          </li>
          <li>
            <Link
              href="/alerts"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/alerts" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <i className="fas fa-exclamation-triangle"></i>
              <span className="font-medium">Alerts</span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-auto">3</span>
            </Link>
          </li>
          <li>
            <Link
              href="/reports"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/reports" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <i className="fas fa-file-alt"></i>
              <span className="font-medium">Reports</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/settings" ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <i className="fas fa-cog"></i>
              <span className="font-medium">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
