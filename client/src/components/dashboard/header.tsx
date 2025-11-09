import { Button } from "@/components/ui/button";

interface HeaderProps {
  lastUpdateTime: string;
  isConnected: boolean;
}

export default function Header({ lastUpdateTime, isConnected }: HeaderProps) {
  const handleExportReport = () => {
    // TODO: Implement report export functionality
    console.log("Exporting report...");
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Real-Time Dashboard</h2>
          <p className="text-slate-600">
            Last updated: <span className="font-medium">{lastUpdateTime || "Loading..."}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`font-medium ${
              isConnected ? 'text-green-700' : 'text-red-700'
            }`}>
              {isConnected ? 'Live Data' : 'Disconnected'}
            </span>
          </div>
          <Button onClick={handleExportReport} className="bg-blue-500 hover:bg-blue-600">
            <i className="fas fa-download mr-2"></i>Export Report
          </Button>
        </div>
      </div>
    </header>
  );
}
