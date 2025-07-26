'use client';

import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {
    Database,
    Server,
    Shield,
    Activity,
    HardDrive,
    Cpu,
    MemoryStick,
    RefreshCw,
    Download,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    ShoppingCart,
    Package,
    FileText
} from 'lucide-react';

interface SystemMetrics {
    cpu : number;
    memory : number;
    disk : number;
    network : { in: number;
        out: number;
        connections: number;
        bandwidth: number;
    };
    load : {
        avg1: string;
        avg5: string;
        avg15: string;
    };
    uptime : number;
    processes : number;
    alerts : Array < {
        type: string;
        message: string;
        value: number;
    } >;
}

interface DatabaseStats {
    collections : Record < string, {documents: number;
        size: number;
        avgObjSize: number;
        indexes: number;} >;
    totalDocuments : number;
    totalSize : number;
    serverInfo : {
        version: string;
        uptime: number;
        connections: {
            current: number;
            available: number;
        };
        timestamp: string;
    };
}

interface SecurityStatus {
    authentication : {
        status: string;
        lastCheck: string;
        method: string;
        sessions: number;
    };
    https : {
        status: string;
        certificate: string;
        expiryDate: string;
    };
    firewall : {
        status: string;
        rules: number;
        blockedIPs: number;
        lastUpdate: string;
    };
    audit : {
        status: string;
        logsRetention: number;
        lastExport: string;
        totalLogs: number;
    };
    apiSecurity : {
        rateLimiting: string;
        requestsPerMinute: number;
        currentLoad: number;
    };
    database : {
        encryption: string;
        backupEncryption: string;
        lastSecurityScan: string;
        vulnerabilities: number;
    };
    monitoring : {
        status: string;
        alerts: number;
        uptime: number;
        lastIncident: string | null;
    };
}

interface SystemAlert {
    id : string;
    type : string;
    severity : 'critical' | 'warning' | 'info';
    title : string;
    message : string;
    timestamp : string;
    category : string;
    actionRequired : boolean;
    suggestion : string;
}

interface OptimizationStatus {
    status : string;
    lastOptimization : string;
    recommendations : string[];
    estimatedImpact : {
        performance: string;
        storage: string;
        querySpeed: string;
    };
}
serverInfo : {}

interface CacheStats {
    cache : {
        size: number;
        entries: number;
        lastCleared: string;
    };
    status : string;
}

export default function SystemPage() {
    const [systemMetrics,
        setSystemMetrics] = useState < SystemMetrics | null > (null);
    const [databaseStats,
        setDatabaseStats] = useState < DatabaseStats | null > (null);
    const [cacheStats,
        setCacheStats] = useState < CacheStats | null > (null);
    const [securityStatus,
        setSecurityStatus] = useState < SecurityStatus | null > (null);
    const [systemAlerts,
        setSystemAlerts] = useState < SystemAlert[] > ([]);
    const [optimizationStatus,
        setOptimizationStatus] = useState < OptimizationStatus | null > (null);
    const [loading,
        setLoading] = useState(true);
    const [refreshing,
        setRefreshing] = useState(false);
    const [lastRefresh,
        setLastRefresh] = useState < Date > (new Date());
    const fetchSystemData = async() => {
        try {
            setRefreshing(true);

            const [metricsRes,
                dbRes,
                cacheRes,
                securityRes,
                alertsRes,
                optimizationRes] = await Promise.all([
                fetch('/api/admin/system-metrics'),
                fetch('/api/admin/database-stats'),
                fetch('/api/admin/clear-cache'),
                fetch('/api/admin/security-status'),
                fetch('/api/admin/system-alerts'),
                fetch('/api/admin/optimize-database')
            ]);

            if (metricsRes.ok) {
                const metrics = await metricsRes.json();
                setSystemMetrics(metrics);
            }

            if (dbRes.ok) {
                const dbData = await dbRes.json();
                setDatabaseStats(dbData);
            }

            if (cacheRes.ok) {
                const cacheData = await cacheRes.json();
                setCacheStats(cacheData);
            }

            if (securityRes.ok) {
                const securityData = await securityRes.json();
                setSecurityStatus(securityData);
            }

            if (alertsRes.ok) {
                const alertsData = await alertsRes.json();
                setSystemAlerts(alertsData.alerts || []);
            }

            if (optimizationRes.ok) {
                const optimizationData = await optimizationRes.json();
                setOptimizationStatus(optimizationData);
            }

            setLastRefresh(new Date());
        } catch (error) {
            console.error('Erreur lors de la récupération des données système:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleClearCache = async() => {
        try {
            const response = await fetch('/api/admin/clear-cache', {method: 'POST'});

            if (response.ok) {
                // Refresh cache stats after clearing
                const cacheRes = await fetch('/api/admin/clear-cache');
                if (cacheRes.ok) {
                    const cacheData = await cacheRes.json();
                    setCacheStats(cacheData);
                }
            }
        } catch (error) {
            console.error('Erreur lors du vidage du cache:', error);
        }
    };

    const handleExportLogs = async() => {
        try {
            window.open('/api/admin/export-logs', '_blank');
        } catch (error) {
            console.error('Erreur lors de l\'export des logs:', error);
        }
    };

    const handleOptimizeDatabase = async() => {
        try {
            const response = await fetch('/api/admin/optimize-database', {method: 'POST'});

            if (response.ok) {
                const result = await response.json();
                console.log('Optimisation réussie:', result);
                // Refresh optimization status and database stats
                await fetchSystemData();
                alert('Optimisation de la base de données terminée avec succès !');
            } else {
                throw new Error('Erreur lors de l\'optimisation');
            }
        } catch (error) {
            console.error('Erreur lors de l\'optimisation de la base de données:', error);
            alert('Erreur lors de l\'optimisation de la base de données');
        }
    };

    useEffect(() => {
        fetchSystemData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchSystemData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatBytes = (bytes : number) => {
        if (bytes === 0) 
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (uptime : number) => {
        const days = Math.floor(uptime / (24 * 3600));
        const hours = Math.floor((uptime % (24 * 3600)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        return `${days}j ${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Administration Système</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Administration Système</h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1"/>
                        Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
                    </Badge>
                    <Button
                        onClick={fetchSystemData}
                        disabled={refreshing}
                        size="sm"
                        variant="outline">
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${refreshing
                            ? 'animate-spin'
                            : ''}`}/>
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Section des alertes dynamiques */}
            {systemAlerts.length > 0 && (
                <div className="space-y-2">
                    {systemAlerts
                        .slice(0, 3)
                        .map((alert) => (
                            <Alert
                                key={alert.id}
                                className={alert.severity === 'critical'
                                ? 'border-red-500 bg-red-50'
                                : alert.severity === 'warning'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-blue-500 bg-blue-50'}>
                                <AlertTriangle
                                    className={`h-4 w-4 ${alert.severity === 'critical'
                                    ? 'text-red-500'
                                    : alert.severity === 'warning'
                                        ? 'text-yellow-500'
                                        : 'text-blue-500'}`}/>
                                <AlertDescription>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <strong>{typeof alert.title === 'string' ? alert.title : 'Titre non disponible'}</strong>
                                            <p className="text-sm">{typeof alert.message === 'string' ? alert.message : 'Message non disponible'}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{typeof alert.suggestion === 'string' ? alert.suggestion : 'Suggestion non disponible'}</p>
                                        </div>
                                        <Badge
                                            variant={alert.severity === 'critical'
                                            ? 'destructive'
                                            : alert.severity === 'warning'
                                                ? 'secondary'
                                                : 'default'}>
                                            {typeof alert.severity === 'string' ? alert.severity : 'unknown'}
                                        </Badge>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                </div>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="database">Base de données</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="security">Sécurité</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                                <Cpu className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemMetrics
                                        ?.cpu || 0}%</div>
                                <Progress
                                    value={systemMetrics
                                    ?.cpu || 0}
                                    className="mt-2"/>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Mémoire</CardTitle>
                                <MemoryStick className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemMetrics
                                        ?.memory || 0}%</div>
                                <Progress
                                    value={systemMetrics
                                    ?.memory || 0}
                                    className="mt-2"/>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Disque</CardTitle>
                                <HardDrive className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemMetrics
                                        ?.disk || 0}%</div>
                                <Progress
                                    value={systemMetrics
                                    ?.disk || 0}
                                    className="mt-2"/>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold">
                                    {systemMetrics
                                        ? formatUptime(systemMetrics.uptime)
                                        : '0j 0h 0m'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Database className="w-5 h-5 mr-2"/>
                                    Statistiques de la base de données
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Total des documents:</span>
                                    <span className="font-bold">{databaseStats
                                            ?.totalDocuments
                                                ?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taille totale:</span>
                                    <span className="font-bold">{formatBytes(databaseStats
                                            ?.totalSize || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Version MongoDB:</span>
                                    <span className="font-bold">{databaseStats
                                            ?.serverInfo
                                                ?.version || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Server className="w-5 h-5 mr-2"/>
                                    Status du système
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>État du serveur:</span>
                                    <Badge variant="default" className="bg-green-500">
                                        <CheckCircle className="w-3 h-3 mr-1"/>
                                        En ligne
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Cache:</span>
                                    <Badge
                                        variant={cacheStats
                                        ?.status === 'active'
                                            ? 'default'
                                            : 'secondary'}>
                                        {cacheStats
                                            ?.status === 'active'
                                                ? 'Actif'
                                                : 'Inactif'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Processus actifs:</span>
                                    <span className="font-bold">{systemMetrics
                                            ?.processes || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="database" className="space-y-4">
                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Collections de la base de données</CardTitle>
                                <CardDescription>
                                    Détail des collections et de leur utilisation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {databaseStats
                                        ?.collections && Object
                                            .entries(databaseStats.collections)
                                            .map(([name, stats]) => (
                                                <div
                                                    key={name}
                                                    className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        {name === 'users' && <Users className="w-5 h-5 text-blue-500"/>}
                                                        {name === 'orders' && <ShoppingCart className="w-5 h-5 text-green-500"/>}
                                                        {name === 'products' && <Package className="w-5 h-5 text-purple-500"/>}
                                                        {name === 'stores' && <Server className="w-5 h-5 text-orange-500"/>}
                                                        {(name === 'notifications' || name === 'messages') && <FileText className="w-5 h-5 text-cyan-500"/>}
                                                        <div>
                                                            <h4 className="font-medium capitalize">{typeof name === 'string' ? name : 'Collection sans nom'}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {stats
                                                                    .documents
                                                                    .toLocaleString()}
                                                                documents
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">{formatBytes(stats.size)}</p>
                                                        <p className="text-sm text-muted-foreground">{stats.indexes}
                                                            index(es)</p>
                                                    </div>
                                                </div>
                                            ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Réseau</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Trafic entrant:</span>
                                    <span className="font-bold">{formatBytes(systemMetrics
                                            ?.network
                                                ?. in || 0)}/s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Trafic sortant:</span>
                                    <span className="font-bold">{formatBytes(systemMetrics
                                            ?.network
                                                ?.out || 0)}/s</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cache système</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Taille du cache:</span>
                                    <span className="font-bold">{formatBytes(cacheStats
                                            ?.cache
                                                ?.size || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Entrées:</span>
                                    <span className="font-bold">{cacheStats
                                            ?.cache
                                                ?.entries
                                                    ?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dernier vidage:</span>
                                    <span className="text-sm">
                                        {cacheStats
                                            ?.cache
                                                ?.lastCleared
                                                    ? new Date(cacheStats.cache.lastCleared).toLocaleString()
                                                    : 'Jamais'
}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="security" className="space-y-4">
                    <div className="grid gap-4">
                        <Alert>
                            <Shield className="h-4 w-4"/>
                            <AlertDescription>
                                {securityStatus
                                    ?.monitoring
                                        ?.status === 'active'
                                            ? `Système de sécurité actif. ${securityStatus.monitoring.alerts} alerte(s) en cours. Uptime: ${securityStatus.monitoring.uptime}%`
                                            : 'Système de sécurité en cours de vérification...'
}
                            </AlertDescription>
                        </Alert>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>État de la sécurité</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span>Authentification:</span>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                variant={securityStatus
                                                ?.authentication
                                                    ?.status === 'active'
                                                        ? 'default'
                                                        : 'secondary'}
                                                className={securityStatus
                                                ?.authentication
                                                    ?.status === 'active'
                                                        ? 'bg-green-500'
                                                        : ''}>
                                                <CheckCircle className="w-3 h-3 mr-1"/> {securityStatus
                                                    ?.authentication
                                                        ?.status || 'Vérification...'}
                                            </Badge>
                                            {securityStatus
                                                ?.authentication
                                                    ?.sessions && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {securityStatus.authentication.sessions}
                                                            sessions
                                                        </span>
                                                    )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Chiffrement HTTPS:</span>
                                        <Badge
                                            variant={securityStatus
                                            ?.https
                                                ?.status === 'active'
                                                    ? 'default'
                                                    : 'secondary'}
                                            className={securityStatus
                                            ?.https
                                                ?.status === 'active'
                                                    ? 'bg-green-500'
                                                    : ''}>
                                            <CheckCircle className="w-3 h-3 mr-1"/> {securityStatus
                                                ?.https
                                                    ?.status || 'Vérification...'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Pare-feu:</span>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                variant={securityStatus
                                                ?.firewall
                                                    ?.status === 'active'
                                                        ? 'default'
                                                        : 'secondary'}
                                                className={securityStatus
                                                ?.firewall
                                                    ?.status === 'active'
                                                        ? 'bg-green-500'
                                                        : ''}>
                                                <CheckCircle className="w-3 h-3 mr-1"/> {securityStatus
                                                    ?.firewall
                                                        ?.status || 'Vérification...'}
                                            </Badge>
                                            {securityStatus
                                                ?.firewall
                                                    ?.rules && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {securityStatus.firewall.rules}
                                                            règles
                                                        </span>
                                                    )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Audit des logs:</span>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                variant={securityStatus
                                                ?.audit
                                                    ?.status === 'active'
                                                        ? 'default'
                                                        : 'secondary'}
                                                className={securityStatus
                                                ?.audit
                                                    ?.status === 'active'
                                                        ? 'bg-green-500'
                                                        : ''}>
                                                <CheckCircle className="w-3 h-3 mr-1"/> {securityStatus
                                                    ?.audit
                                                        ?.status || 'Vérification...'}
                                            </Badge>
                                            {securityStatus
                                                ?.audit
                                                    ?.totalLogs && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {securityStatus
                                                                .audit
                                                                .totalLogs
                                                                .toLocaleString()}
                                                            logs
                                                        </span>
                                                    )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Sécurité avancée</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span>Rate Limiting:</span>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                variant={securityStatus
                                                ?.apiSecurity
                                                    ?.rateLimiting === 'active'
                                                        ? 'default'
                                                        : 'secondary'}
                                                className={securityStatus
                                                ?.apiSecurity
                                                    ?.rateLimiting === 'active'
                                                        ? 'bg-green-500'
                                                        : ''}>
                                                <CheckCircle className="w-3 h-3 mr-1"/> {securityStatus
                                                    ?.apiSecurity
                                                        ?.rateLimiting || 'Vérification...'}
                                            </Badge>
                                            {securityStatus
                                                ?.apiSecurity
                                                    ?.currentLoad && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {securityStatus.apiSecurity.currentLoad}% charge
                                                        </span>
                                                    )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Chiffrement DB:</span>
                                        <Badge
                                            variant={securityStatus
                                            ?.database
                                                ?.encryption === 'active'
                                                    ? 'default'
                                                    : 'secondary'}
                                            className={securityStatus
                                            ?.database
                                                ?.encryption === 'active'
                                                    ? 'bg-green-500'
                                                    : ''}>
                                            <CheckCircle className="w-3 h-3 mr-1"/> {securityStatus
                                                ?.database
                                                    ?.encryption || 'Vérification...'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Vulnérabilités:</span>
                                        <Badge
                                            variant={securityStatus
                                            ?.database
                                                ?.vulnerabilities === 0
                                                    ? 'default'
                                                    : 'destructive'}
                                            className={securityStatus
                                            ?.database
                                                ?.vulnerabilities === 0
                                                    ? 'bg-green-500'
                                                    : ''}>
                                            {securityStatus
                                                ?.database
                                                    ?.vulnerabilities || 0}
                                            trouvée(s)
                                        </Badge>
                                    </div>
                                    {securityStatus
                                        ?.firewall
                                            ?.blockedIPs !== undefined && securityStatus.firewall.blockedIPs > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span>IPs bloquées:</span>
                                                    <Badge variant="secondary">
                                                        {securityStatus.firewall.blockedIPs}
                                                        IP(s)
                                                    </Badge>
                                                </div>
                                            )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions de maintenance</CardTitle>
                                <CardDescription>
                                    Outils pour maintenir et optimiser le système
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Vider le cache</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Vide le cache système pour libérer de la mémoire
                                        </p>
                                    </div>
                                    <Button onClick={handleClearCache} variant="outline">
                                        <Trash2 className="w-4 h-4 mr-2"/>
                                        Vider
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Exporter les logs</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Télécharge les logs système pour analyse
                                        </p>
                                    </div>
                                    <Button onClick={handleExportLogs} variant="outline">
                                        <Download className="w-4 h-4 mr-2"/>
                                        Télécharger
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Optimiser la base de données</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Optimise les performances de la base de données
                                        </p>
                                        {optimizationStatus
                                            ?.lastOptimization && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Dernière optimisation: {new Date(optimizationStatus.lastOptimization).toLocaleString()}
                                                </p>
                                            )}
                                        {optimizationStatus
                                            ?.estimatedImpact && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    Gains estimés: {optimizationStatus.estimatedImpact.performance}
                                                    performance, {optimizationStatus.estimatedImpact.storage}
                                                    stockage
                                                </div>
                                            )}
                                    </div>
                                    <Button onClick={handleOptimizeDatabase} variant="outline">
                                        <Activity className="w-4 h-4 mr-2"/>
                                        Optimiser
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Alert>
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertDescription>
                                Les actions de maintenance peuvent impacter temporairement les performances du
                                système. Il est recommandé de les effectuer pendant les heures de faible trafic.
                            </AlertDescription>
                        </Alert>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
