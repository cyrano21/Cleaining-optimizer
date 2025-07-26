"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Download,
  Clock,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Database,
  Settings,
  Lock,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { GlassMorphismCard } from "@/components/ui/glass-morphism-card";

import { StatCard } from "@/components/ui/stat-card";
import { ModernChart } from "@/components/ui/modern-chart";

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, string | number | boolean | null>;
  ipAddress: string;
  userAgent: string;
  location?: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "auth" | "data" | "system" | "security" | "user" | "admin";
  status: "success" | "failure" | "warning";
  duration?: number;
  metadata?: Record<string, string | number | boolean | null>;
}

interface SecurityEvent {
  id: string;
  type:
    | "login_attempt"
    | "permission_denied"
    | "suspicious_activity"
    | "data_breach"
    | "system_alert";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: Date;
  userId?: string;
  ipAddress: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: new Date("2024-01-22T14:30:00"),
      userId: "admin-001",
      userEmail: "admin@example.com",
      userRole: "super_admin",
      action: "CREATE_USER",
      resource: "users",
      resourceId: "user-123",
      details: { email: "newuser@example.com", role: "vendor" },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "Paris, France",
      severity: "medium",
      category: "admin",
      status: "success",
      duration: 250,
    },
    {
      id: "2",
      timestamp: new Date("2024-01-22T14:25:00"),
      userId: "vendor-001",
      userEmail: "vendor@example.com",
      userRole: "vendor",
      action: "UPDATE_PRODUCT",
      resource: "products",
      resourceId: "prod-456",
      details: { field: "price", oldValue: 99.99, newValue: 89.99 },
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      location: "Lyon, France",
      severity: "low",
      category: "data",
      status: "success",
      duration: 180,
    },
    {
      id: "3",
      timestamp: new Date("2024-01-22T14:20:00"),
      userId: "unknown",
      userEmail: "unknown@suspicious.com",
      userRole: "guest",
      action: "LOGIN_ATTEMPT",
      resource: "auth",
      details: { attempts: 5, reason: "invalid_credentials" },
      ipAddress: "45.123.45.67",
      userAgent: "curl/7.68.0",
      severity: "high",
      category: "security",
      status: "failure",
      duration: 50,
    },
    {
      id: "4",
      timestamp: new Date("2024-01-22T14:15:00"),
      userId: "admin-001",
      userEmail: "admin@example.com",
      userRole: "super_admin",
      action: "DELETE_STORE",
      resource: "stores",
      resourceId: "store-789",
      details: { storeName: "Test Store", reason: "policy_violation" },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "Paris, France",
      severity: "critical",
      category: "admin",
      status: "success",
      duration: 500,
    },
    {
      id: "5",
      timestamp: new Date("2024-01-22T14:10:00"),
      userId: "system",
      userEmail: "system@internal",
      userRole: "system",
      action: "BACKUP_CREATED",
      resource: "system",
      details: { size: "2.5GB", type: "automated" },
      ipAddress: "127.0.0.1",
      userAgent: "Internal-System/1.0",
      severity: "low",
      category: "system",
      status: "success",
      duration: 30000,
    },
  ]);

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: "1",
      type: "suspicious_activity",
      severity: "high",
      description: "Tentatives de connexion multiples depuis une IP suspecte",
      timestamp: new Date("2024-01-22T14:20:00"),
      ipAddress: "45.123.45.67",
      resolved: false,
    },
    {
      id: "2",
      type: "permission_denied",
      severity: "medium",
      description: "Tentative d'accès non autorisé aux données administrateur",
      timestamp: new Date("2024-01-22T13:45:00"),
      userId: "vendor-002",
      ipAddress: "192.168.1.102",
      resolved: true,
      resolvedBy: "admin@example.com",
      resolvedAt: new Date("2024-01-22T14:00:00"),
    },
    {
      id: "3",
      type: "system_alert",
      severity: "critical",
      description: "Pic d'utilisation CPU détecté sur le serveur principal",
      timestamp: new Date("2024-01-22T13:30:00"),
      ipAddress: "127.0.0.1",
      resolved: true,
      resolvedBy: "devops@example.com",
      resolvedAt: new Date("2024-01-22T13:35:00"),
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("today");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const categories = [
    { value: "all", label: "Toutes les catégories" },
    { value: "auth", label: "Authentification" },
    { value: "data", label: "Données" },
    { value: "system", label: "Système" },
    { value: "security", label: "Sécurité" },
    { value: "user", label: "Utilisateur" },
    { value: "admin", label: "Administration" },
  ];

  const severities = [
    { value: "all", label: "Toutes les sévérités" },
    { value: "low", label: "Faible" },
    { value: "medium", label: "Moyenne" },
    { value: "high", label: "Élevée" },
    { value: "critical", label: "Critique" },
  ];

  const statuses = [
    { value: "all", label: "Tous les statuts" },
    { value: "success", label: "Succès" },
    { value: "failure", label: "Échec" },
    { value: "warning", label: "Avertissement" },
  ];

  const dateRanges = [
    { value: "today", label: "Aujourd'hui" },
    { value: "7days", label: "7 derniers jours" },
    { value: "30days", label: "30 derniers jours" },
    { value: "90days", label: "90 derniers jours" },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      selectedCategory === "all" || log.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === "all" || log.severity === selectedSeverity;
    const matchesStatus =
      selectedStatus === "all" || log.status === selectedStatus;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    // Filtrage par date (simplifié)
    const now = new Date();
    const logDate = new Date(log.timestamp);
    let matchesDate = true;

    switch (dateRange) {
      case "today":
        matchesDate = logDate.toDateString() === now.toDateString();
        break;
      case "7days":
        matchesDate =
          now.getTime() - logDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        break;
      case "30days":
        matchesDate =
          now.getTime() - logDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        break;
      case "90days":
        matchesDate =
          now.getTime() - logDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
        break;
    }

    return (
      matchesCategory &&
      matchesSeverity &&
      matchesStatus &&
      matchesSearch &&
      matchesDate
    );
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "failure":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return CheckCircle;
      case "failure":
        return XCircle;
      case "warning":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return Lock;
      case "data":
        return Database;
      case "system":
        return Settings;
      case "security":
        return Shield;
      case "user":
        return User;
      case "admin":
        return Eye;
      default:
        return Activity;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (
      userAgent.includes("Mobile") ||
      userAgent.includes("Android") ||
      userAgent.includes("iPhone")
    ) {
      return Smartphone;
    }
    if (userAgent.includes("curl") || userAgent.includes("Internal")) {
      return Globe;
    }
    return Monitor;
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulation d'export
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const csvContent = [
      "Timestamp,User,Action,Resource,Status,Severity,IP Address",
      ...filteredLogs.map(
        (log) =>
          `${log.timestamp.toISOString()},${log.userEmail},${log.action},${log.resource},${log.status},${log.severity},${log.ipAddress}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const getActivityStats = () => {
    const total = logs.length;
    const success = logs.filter((l) => l.status === "success").length;
    const failure = logs.filter((l) => l.status === "failure").length;
    const critical = logs.filter((l) => l.severity === "critical").length;

    return { total, success, failure, critical };
  };

  const stats = getActivityStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Audit & Logs de Sécurité
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Surveillance et traçabilité de toutes les actions système
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
            >
              <Download
                className={`h-4 w-4 mr-2 ${isExporting ? "animate-spin" : ""}`}
              />
              {isExporting ? "Export..." : "Exporter"}
            </Button>

            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total d'événements"
              value={stats.total.toString()}
              icon={<Activity className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Actions réussies"
              value={stats.success.toString()}
              trend={{
                value: (stats.success / stats.total) * 100,
                isPositive: true,
                label: "Taux de succès",
              }}
              icon={<CheckCircle className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Échecs"
              value={stats.failure.toString()}
              trend={{
                value: (stats.failure / stats.total) * 100,
                isPositive: false,
                label: "Actions échouées",
              }}
              icon={<XCircle className="h-5 w-5" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Événements critiques"
              value={stats.critical.toString()}
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </motion.div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Logs d&apos;Audit</TabsTrigger>
            <TabsTrigger value="security">Événements de Sécurité</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Logs d'Audit */}
          <TabsContent value="logs" className="space-y-6">
            {/* Filtres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-6 gap-4"
            >
              <div className="lg:col-span-2">
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSeverity}
                onValueChange={setSelectedSeverity}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((severity) => (
                    <SelectItem key={severity.value} value={severity.value}>
                      {severity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Liste des logs */}
            <div className="space-y-3">
              {filteredLogs.map((log, index) => {
                const StatusIcon = getStatusIcon(log.status);
                const CategoryIcon = getCategoryIcon(log.category);
                const DeviceIcon = getDeviceIcon(log.userAgent);

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                      onClick={() => setSelectedLog(log)}
                    >
                      <GlassMorphismCard className="h-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              <StatusIcon
                                className={`h-5 w-5 ${getStatusColor(log.status)}`}
                              />
                              <CategoryIcon className="h-4 w-4 text-gray-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                  {log.action.replace(/_/g, " ")}
                                </h3>
                                <Badge
                                  className={getSeverityColor(log.severity)}
                                >
                                  {log.severity}
                                </Badge>
                                <Badge variant="outline">{log.category}</Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {log.userEmail}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {log.ipAddress}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DeviceIcon className="h-3 w-3" />
                                  {log.location || "Localisation inconnue"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(log.duration)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.timestamp.toLocaleTimeString("fr-FR")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.timestamp.toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        </div>
                      </GlassMorphismCard>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredLogs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun log trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Essayez de modifier vos critères de recherche
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Événements de Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4">
              {securityEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassMorphismCard className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            event.severity === "critical"
                              ? "bg-red-100 dark:bg-red-900"
                              : event.severity === "high"
                                ? "bg-orange-100 dark:bg-orange-900"
                                : event.severity === "medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900"
                                  : "bg-green-100 dark:bg-green-900"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              event.severity === "critical"
                                ? "text-red-600 dark:text-red-400"
                                : event.severity === "high"
                                  ? "text-orange-600 dark:text-orange-400"
                                  : event.severity === "medium"
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-green-600 dark:text-green-400"
                            }`}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {event.type.replace(/_/g, " ").toUpperCase()}
                            </h3>
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                            <Badge
                              variant={
                                event.resolved ? "default" : "destructive"
                              }
                            >
                              {event.resolved ? "Résolu" : "En cours"}
                            </Badge>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {event.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>IP: {event.ipAddress}</span>
                            <span>
                              Détecté: {event.timestamp.toLocaleString("fr-FR")}
                            </span>
                            {event.resolved && event.resolvedBy && (
                              <span>Résolu par: {event.resolvedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!event.resolved && (
                        <Button size="sm" variant="outline">
                          Marquer comme résolu
                        </Button>
                      )}
                    </div>
                  </GlassMorphismCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle>Activité par heure</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    title="Activité par heure"
                    type="line"
                    data={[
                      { name: "00h", value: 12 },
                      { name: "04h", value: 8 },
                      { name: "08h", value: 45 },
                      { name: "12h", value: 78 },
                      { name: "16h", value: 92 },
                      { name: "20h", value: 34 },
                    ]}
                    height={300}
                  />
                </CardContent>
              </GlassMorphismCard>

              <GlassMorphismCard className="p-6">
                <CardHeader>
                  <CardTitle>Répartition par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart
                    title="Répartition par catégorie"
                    type="bar"
                    data={[
                      { name: "Admin", value: 35 },
                      { name: "Data", value: 25 },
                      { name: "Auth", value: 20 },
                      { name: "Security", value: 15 },
                      { name: "System", value: 5 },
                    ]}
                    height={300}
                  />
                </CardContent>
              </GlassMorphismCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de détails */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l&apos;événement</DialogTitle>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Action
                    </Label>
                    <p className="text-lg font-semibold">
                      {selectedLog.action}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Statut
                    </Label>
                    <div className="flex items-center gap-2">
                      {React.createElement(getStatusIcon(selectedLog.status), {
                        className: `h-4 w-4 ${getStatusColor(selectedLog.status)}`,
                      })}
                      <span className={getStatusColor(selectedLog.status)}>
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Utilisateur
                    </Label>
                    <p>
                      {selectedLog.userEmail} ({selectedLog.userRole})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Timestamp
                    </Label>
                    <p>{selectedLog.timestamp.toLocaleString("fr-FR")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Adresse IP
                    </Label>
                    <p>{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Durée
                    </Label>
                    <p>{formatDuration(selectedLog.duration)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    User Agent
                  </Label>
                  <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 font-mono">
                    {selectedLog.userAgent}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Détails
                  </Label>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AuditLogsPage;
