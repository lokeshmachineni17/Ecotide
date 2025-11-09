import { useState, useRef, useEffect } from "react";
import { MonitoringSite } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Waves, Thermometer, Droplets, AlertTriangle } from "lucide-react";

interface InteractiveMapProps {
  sites: MonitoringSite[];
  onSiteClick: (site: MonitoringSite) => void;
}

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export default function InteractiveMap({ sites, onSiteClick }: InteractiveMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSite, setSelectedSite] = useState<MonitoringSite | null>(null);
  const [hoveredSite, setHoveredSite] = useState<MonitoringSite | null>(null);

  // Calculate map bounds from site coordinates
  const mapBounds: MapBounds = sites.reduce(
    (bounds, site) => ({
      minLat: Math.min(bounds.minLat, site.latitude),
      maxLat: Math.max(bounds.maxLat, site.latitude),
      minLng: Math.min(bounds.minLng, site.longitude),
      maxLng: Math.max(bounds.maxLng, site.longitude),
    }),
    { 
      minLat: Infinity, 
      maxLat: -Infinity, 
      minLng: Infinity, 
      maxLng: -Infinity 
    }
  );

  // Add padding to bounds
  const latPadding = (mapBounds.maxLat - mapBounds.minLat) * 0.1;
  const lngPadding = (mapBounds.maxLng - mapBounds.minLng) * 0.1;
  const paddedBounds = {
    minLat: mapBounds.minLat - latPadding,
    maxLat: mapBounds.maxLat + latPadding,
    minLng: mapBounds.minLng - lngPadding,
    maxLng: mapBounds.maxLng + lngPadding,
  };

  // Convert geographic coordinates to SVG coordinates
  const geoToSVG = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng - paddedBounds.minLng) / (paddedBounds.maxLng - paddedBounds.minLng)) * width;
    const y = height - ((lat - paddedBounds.minLat) / (paddedBounds.maxLat - paddedBounds.minLat)) * height;
    return { x, y };
  };

  const getSiteColor = (site: MonitoringSite) => {
    const healthScore = site.healthScore || 0;
    if (healthScore >= 80) return "#10b981"; // green
    if (healthScore >= 60) return "#3b82f6"; // blue
    if (healthScore >= 40) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const getSiteStatus = (site: MonitoringSite) => {
    const healthScore = site.healthScore || 0;
    if (healthScore >= 80) return "Excellent";
    if (healthScore >= 60) return "Good";
    if (healthScore >= 40) return "Fair";
    return "Poor";
  };

  const handleSiteClick = (site: MonitoringSite) => {
    setSelectedSite(site);
    onSiteClick(site);
  };

  const mapWidth = 800;
  const mapHeight = 600;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Monitoring Sites Map
          </CardTitle>
          <CardDescription>
            Click on any pin to view detailed site information and recent readings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border">
            <svg
              ref={svgRef}
              width={mapWidth}
              height={mapHeight}
              className="w-full h-auto"
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            >
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Simplified coastline/water bodies */}
              <path
                d={`M 0 ${mapHeight * 0.3} Q ${mapWidth * 0.3} ${mapHeight * 0.2} ${mapWidth * 0.6} ${mapHeight * 0.4} T ${mapWidth} ${mapHeight * 0.3} L ${mapWidth} ${mapHeight} L 0 ${mapHeight} Z`}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="2"
              />
              
              {/* River systems */}
              <path
                d={`M 0 ${mapHeight * 0.5} Q ${mapWidth * 0.2} ${mapHeight * 0.4} ${mapWidth * 0.4} ${mapHeight * 0.6} T ${mapWidth * 0.8} ${mapHeight * 0.5} T ${mapWidth} ${mapHeight * 0.7}`}
                fill="none"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="4"
              />
              
              {/* Site pins */}
              {sites.map((site) => {
                const { x, y } = geoToSVG(site.latitude, site.longitude, mapWidth, mapHeight);
                const isHovered = hoveredSite?.id === site.id;
                const isSelected = selectedSite?.id === site.id;
                const pinSize = isHovered || isSelected ? 20 : 16;
                
                return (
                  <g key={site.id}>
                    {/* Pin shadow */}
                    <circle
                      cx={x + 2}
                      cy={y + 2}
                      r={pinSize / 2}
                      fill="rgba(0, 0, 0, 0.2)"
                    />
                    
                    {/* Pin */}
                    <circle
                      cx={x}
                      cy={y}
                      r={pinSize / 2}
                      fill={getSiteColor(site)}
                      stroke={isSelected ? "#1f2937" : "#ffffff"}
                      strokeWidth={isSelected ? 3 : 2}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredSite(site)}
                      onMouseLeave={() => setHoveredSite(null)}
                      onClick={() => handleSiteClick(site)}
                    />
                    
                    {/* Pin inner dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={4}
                      fill="white"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredSite(site)}
                      onMouseLeave={() => setHoveredSite(null)}
                      onClick={() => handleSiteClick(site)}
                    />
                    
                    {/* Site label */}
                    {(isHovered || isSelected) && (
                      <g>
                        <rect
                          x={x - 60}
                          y={y - 45}
                          width="120"
                          height="30"
                          fill="rgba(0, 0, 0, 0.8)"
                          rx="4"
                        />
                        <text
                          x={x}
                          y={y - 30}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {site.name.split(' ').slice(0, 3).join(' ')}
                        </text>
                        <text
                          x={x}
                          y={y - 18}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                        >
                          Health: {site.healthScore || 0}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Map legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-2">
              <h4 className="font-medium text-sm text-gray-900">Health Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Excellent (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Good (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">Fair (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Poor (0-39%)</span>
                </div>
              </div>
            </div>
            
            {/* Coordinates display */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2">
              <p className="text-xs text-gray-600">
                Lat: {paddedBounds.minLat.toFixed(3)} to {paddedBounds.maxLat.toFixed(3)}
              </p>
              <p className="text-xs text-gray-600">
                Lng: {paddedBounds.minLng.toFixed(3)} to {paddedBounds.maxLng.toFixed(3)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick site info panel */}
      {selectedSite && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedSite.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {selectedSite.location}
                </CardDescription>
              </div>
              <Badge variant={selectedSite.status === 'online' ? 'default' : 'destructive'}>
                {selectedSite.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Waves className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="font-bold text-lg">{selectedSite.healthScore || 0}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Droplets className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-bold">{getSiteStatus(selectedSite)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coordinates</p>
                  <p className="font-mono text-sm">{selectedSite.latitude.toFixed(3)}, {selectedSite.longitude.toFixed(3)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="text-sm">{selectedSite.lastUpdate ? new Date(selectedSite.lastUpdate).toLocaleDateString() : 'No data'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onSiteClick(selectedSite)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Detailed Readings
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedSite(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}