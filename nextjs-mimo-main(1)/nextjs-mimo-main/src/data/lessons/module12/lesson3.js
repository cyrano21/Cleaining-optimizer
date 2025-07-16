// src/data/lessons/module12/lesson3.js
const lesson3 = {
  id: '12-3',
  title: "Déploiement et monitoring d'applications Next.js",
  description:
    'Stratégies avancées de déploiement et de surveillance pour applications Next.js',
  difficulty: 'avancé',
  duration: 60,
  tags: ['Next.js', 'DevOps', 'Monitoring', 'Kubernetes', 'Observabilité'],
  prerequisites: ['11-3', '12-1', '12-2'],
  content: `
    <h2>Déploiement et monitoring avancés pour Next.js</h2>
    <p>Le déploiement et la surveillance efficaces des applications Next.js sont essentiels pour garantir leur fiabilité, leur performance et leur disponibilité en production. Cette leçon couvre les stratégies avancées et les meilleures pratiques dans ces domaines.</p>

    <h3>Plateformes de déploiement pour Next.js</h3>
    <p>Plusieurs plateformes sont adaptées au déploiement d'applications Next.js, chacune avec ses avantages :</p>
    <ul>
      <li><strong>Vercel</strong> : Plateforme optimisée pour Next.js avec déploiements automatiques, prévisualisation et analytics</li>
      <li><strong>AWS Amplify</strong> : Solution complète avec CI/CD, authentification et backend-as-a-service</li>
      <li><strong>Netlify</strong> : Déploiement simplifié avec CDN global et fonctions serverless</li>
      <li><strong>Kubernetes</strong> : Solution auto-hébergée offrant flexibilité et contrôle total</li>
      <li><strong>Google Cloud Run</strong> : Service serverless pour conteneurs avec scaling automatique</li>
    </ul>

    <h3>Déploiement avec Kubernetes</h3>
    <p>Kubernetes offre une solution robuste pour déployer des applications Next.js à grande échelle avec une haute disponibilité et une reprise après sinistre efficace.</p>

    <pre><code class="language-yaml"># Exemple de déploiement Kubernetes pour Next.js
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
  namespace: production
  labels:
    app: nextjs
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nextjs
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: nextjs
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/api/metrics"
    spec:
      containers:
      - name: nextjs
        image: registry.example.com/nextjs-app:v1.2.3
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 15
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      # Anti-affinité pour répartir les pods sur différents nœuds
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - nextjs
              topologyKey: "kubernetes.io/hostname"</code></pre>

    <h3>Monitoring et observabilité</h3>
    <p>Un système de monitoring complet est essentiel pour maintenir la fiabilité et les performances des applications Next.js en production.</p>
    
    <h4>Métriques clés à surveiller</h4>
    <ul>
      <li><strong>Métriques d'application</strong> : Temps de réponse, taux d'erreur, utilisateurs actifs</li>
      <li><strong>Métriques Web Vitals</strong> : LCP, FID, CLS, TTFB</li>
      <li><strong>Métriques système</strong> : Utilisation CPU, mémoire, réseau, disque</li>
      <li><strong>Métriques business</strong> : Conversions, engagement, rétention</li>
    </ul>

    <h4>Outils d'observabilité</h4>
    <ul>
      <li><strong>Prometheus + Grafana</strong> : Collecte de métriques et visualisation</li>
      <li><strong>ELK Stack</strong> : Logging centralisé (Elasticsearch, Logstash, Kibana)</li>
      <li><strong>Jaeger/Zipkin</strong> : Traçage distribué pour les microservices</li>
      <li><strong>Sentry</strong> : Suivi et alerte d'erreurs côté client et serveur</li>
      <li><strong>New Relic/Datadog</strong> : Plateformes d'observabilité tout-en-un</li>
    </ul>

    <pre><code class="language-javascript">// pages/api/metrics.js - Endpoint pour exposer les métriques Prometheus
import client from 'prom-client';
import onFinished from 'on-finished';

// Création et configuration des métriques
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Métrique personnalisée pour mesurer la durée des requêtes
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

// Enregistrement de la métrique
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware pour mesurer la durée des requêtes API
export const metricsMiddleware = (handler) => async (req, res) => {
  const route = req.url;
  const method = req.method;
  const start = process.hrtime();
  
  // Exécuter le handler d'origine
  await handler(req, res);
  
  // Enregistrer la métrique une fois la requête terminée
  onFinished(res, () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;
    httpRequestDurationMicroseconds
      .labels(method, route, res.statusCode)
      .observe(duration);
  });
};

// Endpoint pour exposer les métriques Prometheus
export default async function handler(req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
}</code></pre>
    
    <h3>Gestion des incidents et SRE</h3>
    <p>L'adoption des principes Site Reliability Engineering (SRE) permet d'améliorer la fiabilité et la résilience des applications Next.js :</p>
    <ul>
      <li><strong>Objectifs de niveau de service (SLO/SLI)</strong> : Définition des attentes de fiabilité</li>
      <li><strong>Budgets d'erreur</strong> : Équilibre entre fiabilité et innovation</li>
      <li><strong>Plans de réponse aux incidents</strong> : Processus définis pour résoudre les problèmes</li>
      <li><strong>Post-mortems sans blâme</strong> : Analyse des incidents pour éviter leur récurrence</li>
    </ul>

    <h3>Stratégies de scaling</h3>
    <p>Les applications Next.js peuvent être mises à l'échelle de différentes façons pour gérer des charges variables :</p>
    <ul>
      <li><strong>Scaling horizontal</strong> : Ajout de plus d'instances serveur</li>
      <li><strong>Auto-scaling</strong> : Ajustement automatique des ressources en fonction de la charge</li>
      <li><strong>Edge computing</strong> : Distribution du contenu au plus près des utilisateurs</li>
      <li><strong>CDN</strong> : Mise en cache et distribution globale du contenu statique</li>
    </ul>
    
    <pre><code class="language-yaml"># Exemple d'HorizontalPodAutoscaler pour Kubernetes
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nextjs-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nextjs-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  # Métriques personnalisées
  - type: Pods
    pods:
      metricName: http_request_rate
      targetAverageValue: 1000
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60</code></pre>
  `,
  example: {
    title: "Mise en place d'un système de monitoring complet pour Next.js",
    code: `// Configuration d'un système de monitoring complet pour Next.js

// 1. Instrumentation de l'application Next.js
// lib/monitoring.js
import { NextWebVitalsMetric } from 'next/app';
import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/tracing';
import { metrics } from './prometheus';

// Initialisation de Sentry pour le suivi des erreurs
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
    integrations: [new BrowserTracing()],
    environment: process.env.NODE_ENV,
  });
};

// Suivi des Web Vitals
export const reportWebVitals = ({ id, name, label, value }: NextWebVitalsMetric) => {
  // Envoi à notre API de métriques
  fetch('/api/metrics/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, label, value }),
  });

  // Envoi vers Prometheus si en mode serveur
  if (typeof window === 'undefined' && metrics) {
    const metric = metrics.webVitals.labels(name, label);
    metric.observe(value);
  }
  
  // Envoi vers la console en développement
  if (process.env.NODE_ENV !== 'production') {
    console.log(\`Web Vital: \${name}\`, value);
  }
};

// Middleware de suivi des API routes
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { metrics } from './lib/prometheus';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();

  response.headers.set('X-Response-Time', \`\${Date.now() - start}ms\`);

  // Compteur de requêtes
  if (metrics) {
    metrics.requestCount.inc({
      method: request.method,
      path: request.nextUrl.pathname,
    });
  }

  return response;
}

// 2. Collecte de métriques Prometheus
// lib/prometheus.js
import client from 'prom-client';

// Création du registre
const register = client.register;

// Activation des métriques par défaut
client.collectDefaultMetrics({ register });

// Définition des métriques personnalisées
export const metrics = {
  requestCount: new client.Counter({
    name: 'nextjs_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
  }),
  
  requestDuration: new client.Histogram({
    name: 'nextjs_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.01, 0.03, 0.1, 0.3, 1, 3, 10],
  }),
  
  webVitals: new client.Histogram({
    name: 'nextjs_web_vitals',
    help: 'Next.js Web Vitals metrics',
    labelNames: ['name', 'label'],
    buckets: [10, 30, 100, 300, 1000, 3000, 10000],
  }),
};

// Endpoint pour exposer les métriques
// pages/api/metrics.js
export default async function handler(req, res) {
  // Uniquement accessible depuis le réseau interne ou avec un token
  const token = req.headers['x-metrics-token'];
  if (process.env.NODE_ENV === 'production' && 
      token !== process.env.METRICS_TOKEN && 
      !req.socket.localAddress.startsWith('10.')) {
    return res.status(403).send('Forbidden');
  }

  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
}

// 3. Configuration de Grafana pour la visualisation
// grafana-dashboard.json (extrait)
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      },
      {
        "datasource": "Prometheus",
        "enable": true,
        "expr": "changes(nextjs_deployments_total[1m]) > 0",
        "iconColor": "rgba(255, 96, 96, 1)",
        "name": "Deployments",
        "titleFormat": "Déploiement"
      }
    ]
  },
  "editable": true,
  "panels": [
    {
      "title": "Requêtes par seconde",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(rate(nextjs_http_requests_total[1m])) by (path)",
          "interval": "",
          "legendFormat": "{{path}}",
          "refId": "A"
        }
      ],
      "type": "graph",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "description": "Nombre de requêtes par seconde par chemin"
    },
    {
      "title": "Temps de réponse (p95)",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(nextjs_http_request_duration_seconds_bucket[5m])) by (le, path))",
          "interval": "",
          "legendFormat": "{{path}}",
          "refId": "A"
        }
      ],
      "type": "graph",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
      "description": "95e percentile du temps de réponse"
    }
  ]
}

// 4. Surveillance des erreurs avec Sentry
// sentry.server.config.js et sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERSION,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});

// 5. Kubernetes - ConfigMap pour Prometheus
// prometheus-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: (\\d+)
            replacement: $1
            target_label: __address__
            source_labels: [__meta_kubernetes_pod_ip, __meta_kubernetes_pod_annotation_prometheus_io_port]
            separator: ':'`,
    explanation:
      "Cet exemple présente une approche complète pour le monitoring d'une application Next.js en production. Il combine l'instrumentation côté application (métriques Web Vitals, traçage des requêtes), l'exposition des métriques au format Prometheus, la visualisation avec Grafana, la capture d'erreurs avec Sentry et l'intégration avec Kubernetes pour une solution d'observabilité complète."
  },
  exercise: {
    title: "Configuration d'un système d'alerte pour Next.js",
    description:
      "Configurez un système d'alerte pour une application Next.js déployée en production afin de détecter les problèmes critiques. Quelles sont les meilleures pratiques à appliquer ?",
    options: [
      {
        id: 1,
        text: "Définir des seuils d'alerte uniquement sur les métriques d'infrastructure (CPU, mémoire)",
        correct: false
      },
      {
        id: 2,
        text: 'Définir des alertes basées sur les SLO (Objectives de Niveau de Service) comme le temps de réponse et la disponibilité',
        correct: true
      },
      {
        id: 3,
        text: "Envoyer toutes les alertes à tous les membres de l'équipe sans distinction",
        correct: false
      },
      {
        id: 4,
        text: "Mettre en place des alertes de tendance pour détecter les dégradations progressives avant qu'elles deviennent critiques",
        correct: true
      }
    ],
    solution: `# Solution pour un système d'alerte complet

# Configuration des règles d'alerte dans Prometheus
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: nextjs-app-rules
  namespace: monitoring
spec:
  groups:
  - name: nextjs.rules
    rules:
    # Alertes sur la disponibilité (SLO)
    - alert: HighErrorRate
      expr: sum(rate(nextjs_http_requests_total{status=~"5.."}[5m])) / sum(rate(nextjs_http_requests_total[5m])) > 0.01
      for: 2m
      labels:
        severity: critical
        team: frontend
      annotations:
        summary: "Taux d'erreur élevé"
        description: "Le taux d'erreur est supérieur à 1% depuis 2 minutes ({{ $value | humanizePercentage }})"
        runbook_url: "https://wiki.example.com/runbooks/high-error-rate"

    # Alertes sur les performances (SLO)
    - alert: SlowResponseTime
      expr: histogram_quantile(0.95, sum(rate(nextjs_http_request_duration_seconds_bucket[5m])) by (le)) > 1
      for: 5m
      labels:
        severity: warning
        team: frontend
      annotations:
        summary: "Temps de réponse lent"
        description: "Le temps de réponse P95 est supérieur à 1 seconde depuis 5 minutes ({{ $value | humanizeDuration }})"
        dashboard_url: "https://grafana.example.com/d/nextjs/overview"

    # Alertes sur les tendances (détection précoce)
    - alert: IncreasingErrorRate
      expr: sum(rate(nextjs_http_requests_total{status=~"5.."}[30m])) / sum(rate(nextjs_http_requests_total[30m])) > sum(rate(nextjs_http_requests_total{status=~"5.."}[3h])) / sum(rate(nextjs_http_requests_total[3h])) * 2
      for: 15m
      labels:
        severity: warning
        team: frontend
      annotations:
        summary: "Taux d'erreur en hausse"
        description: "Le taux d'erreur a doublé par rapport à la moyenne des 3 dernières heures"
        
    # Alertes sur la saturation des ressources
    - alert: HighMemoryUsage
      expr: sum(container_memory_usage_bytes{namespace="production", container="nextjs"}) / sum(kube_pod_container_resource_limits_memory_bytes{namespace="production", container="nextjs"}) > 0.85
      for: 10m
      labels:
        severity: warning
        team: infrastructure
      annotations:
        summary: "Utilisation mémoire élevée"
        description: "L'application Next.js utilise plus de 85% de sa limite mémoire depuis 10 minutes"

    # Alertes sur les Web Vitals
    - alert: PoorWebVitals
      expr: histogram_quantile(0.75, sum(rate(nextjs_web_vitals_bucket{name="LCP"}[1h])) by (le)) > 2500
      for: 30m
      labels:
        severity: warning
        team: frontend
      annotations:
        summary: "Web Vitals dégradés"
        description: "75% des utilisateurs ont un LCP supérieur à 2.5 secondes depuis 30 minutes"

# Configuration de l'intégration avec PagerDuty pour les notifications
# alertmanager-config.yaml
apiVersion: v1
kind: Secret
metadata:
  name: alertmanager-config
  namespace: monitoring
type: Opaque
stringData:
  alertmanager.yaml: |-
    global:
      resolve_timeout: 5m
      pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'
      slack_api_url: 'https://hooks.slack.com/services/xxx/yyy/zzz'
    
    route:
      receiver: 'default-receiver'
      group_by: ['alertname', 'job']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
      
      routes:
      - match:
          severity: critical
        receiver: 'pagerduty-critical'
        continue: true
      
      - match:
          team: frontend
          severity: warning
        receiver: 'slack-frontend'
      
      - match:
          team: infrastructure
        receiver: 'slack-infra'
    
    receivers:
    - name: 'default-receiver'
      slack_configs:
      - channel: '#alerts-general'
        send_resolved: true
        title: '{{ template "slack.title" . }}'
        text: '{{ template "slack.text" . }}'
    
    - name: 'pagerduty-critical'
      pagerduty_configs:
      - service_key: 'YOUR_PD_SERVICE_KEY'
        send_resolved: true
        description: '{{ template "pagerduty.description" . }}'
        severity: 'critical'
        details:
          firing: '{{ template "pagerduty.firing" . }}'
    
    - name: 'slack-frontend'
      slack_configs:
      - channel: '#alerts-frontend'
        send_resolved: true
        title: '{{ template "slack.title" . }}'
        text: '{{ template "slack.text" . }}'
    
    - name: 'slack-infra'
      slack_configs:
      - channel: '#alerts-infrastructure'
        send_resolved: true
        title: '{{ template "slack.title" . }}'
        text: '{{ template "slack.text" . }}'

    templates:
    - '/etc/alertmanager/template/*.tmpl'

# Custom health check API pour Next.js
# pages/api/health/index.js
export default function handler(req, res) {
  // Vérification basique
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
  };

  try {
    // Vérifier que les services critiques sont disponibles
    // Par exemple, connexion à la base de données
    
    res.status(200).json(healthcheck);
  } catch (e) {
    healthcheck.status = 'error';
    healthcheck.error = e.message;
    res.status(503).json(healthcheck);
  }
}

# pages/api/health/readiness.js
export default async function handler(req, res) {
  // Pour les vérifications plus complètes qui déterminent si le service est prêt à recevoir du trafic
  try {
    // Vérification des dépendances externes
    await Promise.all([
      checkDatabaseConnection(),
      checkRedisConnection(),
      checkAPIAccess(),
    ]);
    
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ 
      status: 'not_ready', 
      reason: error.message,
      subsystemsStatus: {
        database: await checkDatabaseHealthSilent(),
        redis: await checkRedisHealthSilent(),
        api: await checkAPIHealthSilent(),
      }
    });
  }
}`
  },
  quiz: {
    title: 'Quiz sur le déploiement et le monitoring',
    questions: [
      {
        question:
          "Qu'est-ce qu'un SLO (Service Level Objective) dans le contexte d'une application Next.js ?",
        options: [
          "Une limite d'utilisation des ressources système",
          "Un objectif mesurable de fiabilité ou de performance que l'équipe s'engage à maintenir",
          'Un outil de monitoring pour les applications Next.js',
          'Une configuration spécifique à Next.js pour optimiser les performances'
        ],
        correctAnswer:
          "Un objectif mesurable de fiabilité ou de performance que l'équipe s'engage à maintenir"
      },
      {
        question:
          "Pourquoi est-il important d'utiliser à la fois des sondes de préparation (readiness) et de vivacité (liveness) dans Kubernetes pour les applications Next.js ?",
        options: [
          'Les sondes de préparation déterminent si un pod peut recevoir du trafic, tandis que les sondes de vivacité vérifient si le pod doit être redémarré',
          'Les sondes de préparation sont utilisées en développement, les sondes de vivacité en production',
          'Les sondes de préparation vérifient le frontend, les sondes de vivacité vérifient le backend',
          'Les sondes de préparation sont plus rapides à exécuter que les sondes de vivacité'
        ],
        correctAnswer:
          'Les sondes de préparation déterminent si un pod peut recevoir du trafic, tandis que les sondes de vivacité vérifient si le pod doit être redémarré'
      },
      {
        question:
          "Quelle métrique Web Vital est la plus importante pour mesurer la performance perçue par l'utilisateur d'une application Next.js ?",
        options: [
          'First Input Delay (FID)',
          'Time To First Byte (TTFB)',
          'Largest Contentful Paint (LCP)',
          'Server Response Time (SRT)'
        ],
        correctAnswer: 'Largest Contentful Paint (LCP)'
      },
      {
        question:
          'Qu\'est-ce que le "cardinality explosion" dans le contexte de la collecte de métriques Prometheus ?',
        options: [
          'Une attaque de sécurité visant les serveurs Prometheus',
          "Une augmentation rapide de l'espace de stockage nécessaire due à un trop grand nombre de combinaisons de labels",
          'Un bug spécifique à Next.js qui cause des erreurs dans les métriques',
          "Une technique d'optimisation pour réduire le temps de requête des métriques"
        ],
        correctAnswer:
          "Une augmentation rapide de l'espace de stockage nécessaire due à un trop grand nombre de combinaisons de labels"
      }
    ]
  },
  project: {
    title: "Mise en place d'un système d'observabilité complet pour Next.js",
    description: `Dans ce projet, vous allez concevoir et implémenter un système d'observabilité complet pour une application Next.js déployée en production. Vous devrez:
    
1. Instrumenter l'application pour collecter des métriques clés
2. Configurer Prometheus pour la collecte de métriques
3. Créer des tableaux de bord Grafana pour la visualisation
4. Mettre en place un système d'alerte
5. Implémenter un système de logging centralisé

L'objectif est de créer un système qui permet de détecter rapidement les problèmes, d'analyser les performances et d'améliorer la fiabilité de l'application.`,
    initialCode: `// pages/api/health.js - Endpoint de healthcheck basique
export default function handler(req, res) {
  res.status(200).json({ status: 'OK' });
}

// _app.js - Configuration de base de l'application
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;

// pages/index.js - Page d'accueil
import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Next.js App</title>
      </Head>
      <main>
        <h1>Welcome to Next.js</h1>
      </main>
    </div>
  );
}`,
    solution: `// Solution complète d'observabilité pour Next.js

// 1. Instrumentation de l'application
// ===================================

// lib/monitoring/index.js - Module central d'instrumentation
import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';
import { setupPrometheus } from './prometheus';
import { initializeTracing } from './tracing';
import { reportWebVitals } from './webVitals';

export function initializeMonitoring() {
  // Initialisation de Sentry pour le suivi des erreurs
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERSION,
    tracesSampleRate: 0.1,
    integrations: [
      // Ajout d'intégrations spécifiques selon besoin
    ],
  });

  // Initialisation du tracing distribué
  initializeTracing();

  // Configuration de Prometheus si en environnement serveur
  if (typeof window === 'undefined') {
    setupPrometheus();
  }

  logger.info('Monitoring initialized', {
    version: process.env.NEXT_PUBLIC_VERSION,
    environment: process.env.NODE_ENV,
  });

  return { reportWebVitals };
}

// lib/monitoring/prometheus.js - Configuration Prometheus
import client from 'prom-client';

// Création du registre
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Définition des métriques personnalisées
export const metrics = {
  // Compteur de requêtes HTTP
  httpRequestsTotal: new client.Counter({
    name: 'nextjs_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path', 'status'],
    registers: [register],
  }),

  // Histogramme des durées de requête
  httpRequestDuration: new client.Histogram({
    name: 'nextjs_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    registers: [register],
  }),

  // Métriques Web Vitals
  webVitals: new client.Summary({
    name: 'nextjs_web_vitals',
    help: 'Next.js Web Vitals metrics',
    labelNames: ['name', 'id', 'url'],
    percentiles: [0.5, 0.9, 0.95, 0.99],
    registers: [register],
  }),

  // Métriques de cache
  cacheHits: new client.Counter({
    name: 'nextjs_cache_hits_total',
    help: 'Cache hits',
    labelNames: ['cache_type'],
    registers: [register],
  }),

  cacheMisses: new client.Counter({
    name: 'nextjs_cache_misses_total',
    help: 'Cache misses',
    labelNames: ['cache_type'],
    registers: [register],
  }),

  // Métriques business personnalisées
  userActions: new client.Counter({
    name: 'nextjs_user_actions_total',
    help: 'User actions',
    labelNames: ['action', 'status'],
    registers: [register],
  }),
};

export function setupPrometheus() {
  return { metrics, register };
}

// Middleware pour le suivi des requêtes API
// middleware.js
import { NextResponse } from 'next/server';
import { metrics } from './lib/monitoring/prometheus';

export function middleware(request) {
  const start = Date.now();
  const response = NextResponse.next();

  // Uniquement pour les routes API
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      
      metrics.httpRequestsTotal.inc({
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
      });
      
      metrics.httpRequestDuration.observe(
        {
          method: request.method,
          path: request.nextUrl.pathname,
        },
        duration
      );
    });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};

// Endpoint pour exposer les métriques Prometheus
// pages/api/monitoring/metrics.js
import { setupPrometheus } from '../../../lib/monitoring/prometheus';

export default async function handler(req, res) {
  // Protection basique
  const authHeader = req.headers.authorization;
  if (process.env.NODE_ENV === 'production' && 
      (!authHeader || authHeader !== \`Bearer \${process.env.METRICS_TOKEN}\`)) {
    return res.status(403).send('Forbidden');
  }

  const { register } = setupPrometheus();
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
}

// lib/monitoring/webVitals.js - Suivi des Web Vitals
import { metrics } from './prometheus';

export function reportWebVitals({ id, name, label, value }) {
  // Envoi à notre endpoint API
  const body = {
    id,
    name,
    label,
    value,
    url: window.location.href,
  };

  // Envoi direct à notre API
  const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/monitoring/vitals', blob);
  } else {
    fetch('/api/monitoring/vitals', {
      method: 'POST',
      body: blob,
      keepalive: true,
    });
  }

  // Log pour le développement
  if (process.env.NODE_ENV !== 'production') {
    console.log(\`Web Vital: \${name}\`, value);
  }
}

// pages/api/monitoring/vitals.js - Endpoint pour collecter les Web Vitals
import { metrics } from '../../../lib/monitoring/prometheus';
import { logger } from '../../../lib/monitoring/logger';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { name, id, value, url } = req.body;
    
    // Enregistrer la métrique
    metrics.webVitals.observe({ name, id, url }, value);
    
    // Logger l'information
    logger.info('Web Vital received', { 
      name, 
      value, 
      url,
      userId: req.cookies.userId || 'anonymous',
    });
    
    res.status(200).end();
  } catch (err) {
    logger.error('Error processing Web Vital', { error: err });
    res.status(400).end();
  }
}

// lib/monitoring/logger.js - Logger structuré
import pino from 'pino';

// Configuration de base du logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Ajout d'informations par défaut
  base: {
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_VERSION,
    service: 'nextjs-app',
  },
  // En développement, utiliser un format plus lisible
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

// Middleware pour le logging des requêtes
// middleware/logging.js
import { logger } from '../lib/monitoring/logger';

export function withLogging(handler) {
  return async (req, res) => {
    const start = Date.now();
    
    // Créer un ID de requête unique
    const requestId = crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    
    // Logger le début de la requête
    logger.info('API request started', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });
    
    try {
      // Exécuter le handler
      await handler(req, res);
      
      // Logger la fin de la requête
      const duration = Date.now() - start;
      logger.info('API request completed', {
        requestId,
        statusCode: res.statusCode,
        duration,
      });
    } catch (error) {
      // Logger l'erreur
      logger.error('API request failed', {
        requestId,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        statusCode: res.statusCode || 500,
      });
      
      // Re-throw pour que Next.js puisse gérer l'erreur
      throw error;
    }
  };
}

// 2. Healthchecks avancés
// =======================

// pages/api/health/index.js - Health check standard
export default function handler(req, res) {
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    version: process.env.NEXT_PUBLIC_VERSION,
    environment: process.env.NODE_ENV,
  };
  
  res.status(200).json(healthcheck);
}

// pages/api/health/liveness.js - Liveness check
export default function handler(req, res) {
  // Vérifier uniquement si l'application est en vie
  // Ne pas faire de vérifications externes ici
  res.status(200).json({ status: 'ok' });
}

// pages/api/health/readiness.js - Readiness check
import { checkDatabaseConnection } from '../../../lib/db';
import { checkRedisConnection } from '../../../lib/redis';
import { logger } from '../../../lib/monitoring/logger';

export default async function handler(req, res) {
  try {
    // Vérification des dépendances externes
    const dbStatus = await checkDatabaseConnection();
    const cacheStatus = await checkRedisConnection();
    
    // Si toutes les vérifications sont OK
    res.status(200).json({
      status: 'ready',
      checks: {
        database: dbStatus,
        cache: cacheStatus,
      },
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      checks: {
        database: error.cause?.database || 'unknown',
        cache: error.cause?.cache || 'unknown',
      },
    });
  }
}

// 3. Configuration de l'application avec monitoring
// ================================================

// pages/_app.js - Application avec monitoring intégré
import '../styles/globals.css';
import { initializeMonitoring } from '../lib/monitoring';
import ErrorBoundary from '../components/ErrorBoundary';

// Initialiser le monitoring
const { reportWebVitals } = initializeMonitoring();

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

// Exporter reportWebVitals pour Next.js
export { reportWebVitals };

export default MyApp;

// 4. Configuration Kubernetes
// ==========================

// deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
  namespace: production
  labels:
    app: nextjs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nextjs-app
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: nextjs-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/api/monitoring/metrics"
    spec:
      containers:
      - name: nextjs
        image: registry.example.com/nextjs-app:v1.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: METRICS_TOKEN
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: metrics-token
        - name: NEXT_PUBLIC_VERSION
          value: "v1.0.0"
        envFrom:
        - configMapRef:
            name: nextjs-app-config
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "200m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /api/health/liveness
            port: http
          initialDelaySeconds: 30
          periodSeconds: 15
        readinessProbe:
          httpGet:
            path: /api/health/readiness
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
        startupProbe:
          httpGet:
            path: /api/health
            port: http
          failureThreshold: 30
          periodSeconds: 5
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: log-volume
          mountPath: /app/logs
      volumes:
      - name: tmp
        emptyDir: {}
      - name: log-volume
        persistentVolumeClaim:
          claimName: nextjs-logs-pvc

# 5. Configuration des alertes
# ===========================

# prometheusrule.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: nextjs-alerts
  namespace: monitoring
spec:
  groups:
  - name: nextjs-alerts
    rules:
    # Alertes de disponibilité
    - alert: NextJSHighErrorRate
      expr: sum(rate(nextjs_http_requests_total{status=~"5.."}[5m])) by (app) / sum(rate(nextjs_http_requests_total[5m])) by (app) > 0.05
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Taux d'erreur élevé sur {{ $labels.app }}"
        description: "L'application a un taux d'erreur > 5% depuis 2 min ({{ $value | humanizePercentage }})"
    
    # Alertes de performance
    - alert: NextJSHighResponseTime
      expr: histogram_quantile(0.95, sum by(le, app) (rate(nextjs_http_request_duration_seconds_bucket[5m]))) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Temps de réponse élevé sur {{ $labels.app }}"
        description: "Le temps de réponse P95 est > 2s depuis 5 min ({{ $value | humanizeDuration }})"
    
    # Alertes sur Web Vitals
    - alert: NextJSPoorWebVitals
      expr: histogram_quantile(0.75, sum(rate(nextjs_web_vitals_bucket{name="LCP"}[30m])) by (le)) > 2500
      for: 1h
      labels:
        severity: warning
      annotations:
        summary: "Web Vitals dégradés"
        description: "75% des utilisateurs ont un LCP > 2.5s depuis 1h"
        
    # Alertes de ressources
    - alert: NextJSHighMemoryUsage
      expr: sum(container_memory_working_set_bytes{namespace="production", container="nextjs"}) / sum(kube_pod_container_resource_limits_memory_bytes{namespace="production", container="nextjs"}) > 0.85
      for: 15m
      labels:
        severity: warning
      annotations:
        summary: "Utilisation mémoire élevée"
        description: "L'application Next.js utilise > 85% de sa limite mémoire depuis 15 min"

# 6. Visualisation Grafana - Exemple de dashboard
# ==============================================

# nextjs-dashboard.json (extrait)
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      },
      {
        "datasource": "Prometheus",
        "enable": true,
        "expr": "changes(nextjs_deployments_total[1m]) > 0",
        "iconColor": "rgba(255, 96, 96, 1)",
        "name": "Deployments",
        "titleFormat": "Deployment"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "datasource": null,
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 6,
        "x": 0,
        "y": 0
      },
      "id": 123,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "text": {},
        "textMode": "auto"
      },
      "pluginVersion": "7.5.5",
      "targets": [
        {
          "expr": "sum(rate(nextjs_http_requests_total[5m]))",
          "interval": "",
          "legendFormat": "",
          "refId": "A"
        }
      ],
      "title": "Requêtes / seconde",
      "type": "stat"
    }
  ]
}`
  }
};

export default lesson3;
