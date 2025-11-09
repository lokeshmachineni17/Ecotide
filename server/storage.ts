import { type MonitoringSite, type SensorReading, type Alert, type InsertMonitoringSite, type InsertSensorReading, type InsertAlert } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Monitoring Sites
  getMonitoringSites(): Promise<MonitoringSite[]>;
  getMonitoringSite(id: string): Promise<MonitoringSite | undefined>;
  createMonitoringSite(site: InsertMonitoringSite): Promise<MonitoringSite>;
  updateMonitoringSiteStatus(id: string, status: string, healthScore: number): Promise<MonitoringSite | undefined>;

  // Sensor Readings
  getSensorReadings(siteId: string, limit?: number): Promise<SensorReading[]>;
  getLatestSensorReading(siteId: string): Promise<SensorReading | undefined>;
  createSensorReading(reading: InsertSensorReading): Promise<SensorReading>;

  // Alerts
  getActiveAlerts(): Promise<Alert[]>;
  getAlertsBySite(siteId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  dismissAlert(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private sites: Map<string, MonitoringSite>;
  private readings: Map<string, SensorReading>;
  private alerts: Map<string, Alert>;

  constructor() {
    this.sites = new Map();
    this.readings = new Map();
    this.alerts = new Map();
    this.initializeData().catch(console.error);
  }

  private async initializeData() {
    // Initialize with sample monitoring sites
    const sites = [
      {
        name: "Murray River Site A",
        location: "-35.1185, 147.3598",
        latitude: -35.1185,
        longitude: 147.3598,
        status: "online",
        healthScore: 92,
      },
      {
        name: "Wagga Lagoon",
        location: "-35.1056, 147.3494", 
        latitude: -35.1056,
        longitude: 147.3494,
        status: "online",
        healthScore: 76,
      },
      {
        name: "Murrumbidgee River Site C-07",
        location: "-35.1344, 147.3247",
        latitude: -35.1344,
        longitude: 147.3247,
        status: "online",
        healthScore: 89,
      },
      {
        name: "Lake Albert",
        location: "-35.1598, 147.3112",
        latitude: -35.1598,
        longitude: 147.3112,
        status: "offline",
        healthScore: 0,
      },
    ];

    // Create sites sequentially and add initial sensor readings
    for (const site of sites) {
      const createdSite = await this.createMonitoringSite(site);
      
      // Add initial sensor reading for each site
      if (site.status === "online") {
        await this.createSensorReading({
          siteId: createdSite.id,
          phLevel: 7.2 + (Math.random() - 0.5) * 0.4,
          temperature: 18.5 + (Math.random() - 0.5) * 2.0,
          dissolvedOxygen: 8.3 + (Math.random() - 0.5) * 1.0,
          nitrates: Math.max(0, 2.1 + (Math.random() - 0.5) * 0.8),
          turbidity: Math.max(0, 5.2 + (Math.random() - 0.5) * 2.0),
        });
      }
    }

    // Initialize with sample alerts
    setTimeout(() => {
      this.createAlert({
        siteId: Array.from(this.sites.keys())[0],
        title: "High Nitrate Prediction",
        description: "ML model predicts nitrate levels will exceed safe thresholds in Murray River Site A within 6-8 hours based on current trends.",
        priority: "high",
        alertType: "prediction",
        confidence: 94,
        eta: "6-8 hours",
        isActive: true,
      });

      this.createAlert({
        siteId: Array.from(this.sites.keys())[1],
        title: "Temperature Anomaly",
        description: "Unusual temperature spike detected at Wagga Lagoon. May indicate thermal pollution source.",
        priority: "medium",
        alertType: "anomaly",
        confidence: 87,
        eta: null,
        isActive: true,
      });

      this.createAlert({
        siteId: Array.from(this.sites.keys())[2],
        title: "Maintenance Reminder",
        description: "Sensor calibration due for Site C-07. Schedule maintenance to ensure data accuracy.",
        priority: "low",
        alertType: "maintenance",
        confidence: null,
        eta: null,
        isActive: true,
      });
    }, 1000);
  }

  async getMonitoringSites(): Promise<MonitoringSite[]> {
    return Array.from(this.sites.values());
  }

  async getMonitoringSite(id: string): Promise<MonitoringSite | undefined> {
    return this.sites.get(id);
  }

  async createMonitoringSite(insertSite: InsertMonitoringSite): Promise<MonitoringSite> {
    const id = randomUUID();
    const site: MonitoringSite = {
      ...insertSite,
      id,
      status: insertSite.status || "online",
      healthScore: insertSite.healthScore || 0,
      lastUpdate: new Date(),
    };
    this.sites.set(id, site);
    return site;
  }

  async updateMonitoringSiteStatus(id: string, status: string, healthScore: number): Promise<MonitoringSite | undefined> {
    const site = this.sites.get(id);
    if (site) {
      const updatedSite = { ...site, status, healthScore, lastUpdate: new Date() };
      this.sites.set(id, updatedSite);
      return updatedSite;
    }
    return undefined;
  }

  async getSensorReadings(siteId: string, limit = 50): Promise<SensorReading[]> {
    return Array.from(this.readings.values())
      .filter(reading => reading.siteId === siteId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async getLatestSensorReading(siteId: string): Promise<SensorReading | undefined> {
    const readings = await this.getSensorReadings(siteId, 1);
    return readings[0];
  }

  async createSensorReading(insertReading: InsertSensorReading): Promise<SensorReading> {
    const id = randomUUID();
    const reading: SensorReading = {
      ...insertReading,
      id,
      phLevel: insertReading.phLevel || null,
      temperature: insertReading.temperature || null,
      dissolvedOxygen: insertReading.dissolvedOxygen || null,
      nitrates: insertReading.nitrates || null,
      turbidity: insertReading.turbidity || null,
      timestamp: new Date(),
    };
    this.readings.set(id, reading);
    return reading;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.isActive)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      });
  }

  async getAlertsBySite(siteId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.siteId === siteId);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      confidence: insertAlert.confidence || null,
      eta: insertAlert.eta || null,
      isActive: insertAlert.isActive !== undefined ? insertAlert.isActive : true,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async dismissAlert(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      this.alerts.set(id, { ...alert, isActive: false });
    }
  }
}

export const storage = new MemStorage();
