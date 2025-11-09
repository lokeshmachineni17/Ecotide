interface HealthScoreProps {
  healthScore: number;
}

export default function HealthScore({ healthScore }: HealthScoreProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 85) return { status: "Excellent", color: "text-green-600" };
    if (score >= 70) return { status: "Good", color: "text-blue-600" };
    if (score >= 55) return { status: "Fair", color: "text-amber-600" };
    return { status: "Poor", color: "text-red-600" };
  };

  const { status, color } = getHealthStatus(healthScore);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Environmental Health Score</h3>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-40 h-40">
            <circle 
              cx="80" 
              cy="80" 
              r="70" 
              stroke="#e2e8f0" 
              strokeWidth="8" 
              fill="transparent"
            />
            <circle 
              cx="80" 
              cy="80" 
              r="70" 
              stroke={healthScore >= 85 ? "#10b981" : healthScore >= 70 ? "#3b82f6" : healthScore >= 55 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${color}`}>{healthScore}</div>
              <div className="text-sm text-slate-600">{status}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Water Quality</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, healthScore + 5)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-green-600">{Math.min(100, healthScore + 5)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Ecosystem Balance</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, healthScore - 2)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-green-600">{Math.max(0, healthScore - 2)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Pollution Risk</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-slate-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(10, 100 - healthScore)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-amber-600">
              {100 - healthScore < 30 ? 'Low' : 100 - healthScore < 60 ? 'Medium' : 'High'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
