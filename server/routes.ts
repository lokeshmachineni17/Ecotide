import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSensorReadingSchema, insertAlertSchema, wsMessageSchema, type WSMessage } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API Routes
  app.get("/api/sites", async (_req, res) => {
    try {
      const sites = await storage.getMonitoringSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitoring sites" });
    }
  });

  app.get("/api/sites/:id/readings", async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const readings = await storage.getSensorReadings(id, limit);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor readings" });
    }
  });

  app.get("/api/sites/:id/latest-reading", async (req, res) => {
    try {
      const { id } = req.params;
      const reading = await storage.getLatestSensorReading(id);
      res.json(reading || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest reading" });
    }
  });

  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.dismissAlert(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to dismiss alert" });
    }
  });

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Function to broadcast to all connected clients
  function broadcast(message: WSMessage) {
    const messageStr = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Simulate real-time data generation
  let simulationInterval: NodeJS.Timeout;

  async function generateRealtimeData() {
    const sites = await storage.getMonitoringSites();
    
    for (const site of sites) {
      if (site.status === "online") {
        // Generate realistic sensor data with some variation
        const baseValues = {
          phLevel: 7.2,
          temperature: 18.5,
          dissolvedOxygen: 8.3,
          nitrates: 2.1,
          turbidity: 5.2,
        };

        const reading = {
          siteId: site.id,
          phLevel: baseValues.phLevel + (Math.random() - 0.5) * 0.4,
          temperature: baseValues.temperature + (Math.random() - 0.5) * 2.0,
          dissolvedOxygen: baseValues.dissolvedOxygen + (Math.random() - 0.5) * 1.0,
          nitrates: Math.max(0, baseValues.nitrates + (Math.random() - 0.5) * 0.8),
          turbidity: Math.max(0, baseValues.turbidity + (Math.random() - 0.5) * 2.0),
        };

        await storage.createSensorReading(reading);

        // Calculate health score based on readings
        let healthScore = 100;
        if (reading.phLevel < 6.5 || reading.phLevel > 8.5) healthScore -= 20;
        if (reading.temperature > 25 || reading.temperature < 10) healthScore -= 15;
        if (reading.dissolvedOxygen < 6) healthScore -= 25;
        if (reading.nitrates > 3) healthScore -= 20;
        if (reading.turbidity > 10) healthScore -= 10;
        
        healthScore = Math.max(0, Math.min(100, healthScore));

        await storage.updateMonitoringSiteStatus(site.id, "online", healthScore);

        // Broadcast sensor update
        broadcast({
          type: "sensor_update",
          data: {
            siteId: site.id,
            readings: reading,
          },
        });

        // Broadcast site status update
        broadcast({
          type: "site_status_update", 
          data: {
            siteId: site.id,
            status: "online",
            healthScore,
          },
        });

        // Randomly generate alerts for concerning readings
        if (reading.nitrates > 3.5 && Math.random() < 0.1) {
          const alert = await storage.createAlert({
            siteId: site.id,
            title: "High Nitrate Alert",
            description: `Nitrate levels at ${site.name} have exceeded safe thresholds.`,
            priority: "high",
            alertType: "anomaly",
            confidence: 92,
            eta: null,
            isActive: true,
          });

          broadcast({
            type: "alert_created",
            data: alert,
          });
        }
      }
    }
  }

  // Start real-time data simulation
  simulationInterval = setInterval(generateRealtimeData, 30000); // Every 30 seconds
  
  // Initial data generation
  setTimeout(generateRealtimeData, 2000);

  return httpServer;
}
