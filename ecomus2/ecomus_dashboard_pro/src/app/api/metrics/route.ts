import { NextRequest, NextResponse } from 'next/server';
import { getMetrics, clearMetrics, autoOptimize } from '@/middleware/performance';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API Route pour les métriques de performance
 * Permet de monitorer et optimiser les performances de l'application
 */

// GET /api/metrics - Récupérer les métriques de performance
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const format = searchParams.get('format') || 'json';
    const autoOpt = searchParams.get('optimize') === 'true';

    // Récupérer les métriques
    const metrics = getMetrics(endpoint || undefined);
    
    // Générer des recommandations d'optimisation si demandé
    const recommendations = autoOpt ? autoOptimize() : [];

    const response = {
      timestamp: new Date().toISOString(),
      metrics,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };

    // Retourner en format CSV si demandé
    if (format === 'csv' && metrics && typeof metrics === 'object' && 'slowestEndpoints' in metrics) {
      const csvData = generateCSV(metrics.slowestEndpoints || []);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="metrics.csv"'
        }
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/metrics - Nettoyer les métriques
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    clearMetrics(endpoint || undefined);

    return NextResponse.json({
      message: endpoint 
        ? `Métriques supprimées pour ${endpoint}`
        : 'Toutes les métriques ont été supprimées'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des métriques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/metrics/alert - Configurer des alertes de performance
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { thresholds, notifications } = body;

    // Valider les seuils
    if (!thresholds || typeof thresholds !== 'object') {
      return NextResponse.json(
        { error: 'Seuils invalides' },
        { status: 400 }
      );
    }

    // Analyser les métriques actuelles
    const metrics = getMetrics();
    const alerts: Array<{
      type: string;
      severity: string;
      endpoint: string;
      metric: string;
      value: number;
      threshold: number;
      message: string;
    }> = [];

    if (typeof metrics === 'object' && 'slowestEndpoints' in metrics) {
      metrics.slowestEndpoints?.forEach((endpoint: any) => {
        if (!endpoint) return;
        
        // Vérifier les seuils de performance
        if (thresholds.maxAvgDuration && endpoint.avgDuration > thresholds.maxAvgDuration) {
          alerts.push({
            type: 'performance',
            severity: 'warning',
            endpoint: endpoint.endpoint,
            metric: 'avgDuration',
            value: endpoint.avgDuration,
            threshold: thresholds.maxAvgDuration,
            message: `Temps de réponse moyen élevé: ${endpoint.avgDuration}ms`
          });
        }

        if (thresholds.maxP95Duration && endpoint.p95Duration > thresholds.maxP95Duration) {
          alerts.push({
            type: 'performance',
            severity: 'critical',
            endpoint: endpoint.endpoint,
            metric: 'p95Duration',
            value: endpoint.p95Duration,
            threshold: thresholds.maxP95Duration,
            message: `P95 élevé: ${endpoint.p95Duration}ms`
          });
        }

        if (thresholds.maxRequestCount && endpoint.count > thresholds.maxRequestCount) {
          alerts.push({
            type: 'traffic',
            severity: 'info',
            endpoint: endpoint.endpoint,
            metric: 'requestCount',
            value: endpoint.count,
            threshold: thresholds.maxRequestCount,
            message: `Trafic élevé: ${endpoint.count} requêtes`
          });
        }
      });
    }

    // Envoyer des notifications si configurées
    if (notifications && alerts.length > 0) {
      await sendNotifications(alerts, notifications);
    }

    return NextResponse.json({
      alertsGenerated: alerts.length,
      alerts: alerts.slice(0, 10), // Limiter à 10 alertes dans la réponse
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la génération des alertes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour générer du CSV
function generateCSV(endpoints: any[]): string {
  const headers = ['Endpoint', 'Count', 'Avg Duration (ms)', 'Min Duration (ms)', 'Max Duration (ms)', 'P95 Duration (ms)', 'Last Request'];
  const rows = endpoints.map(ep => [
    ep.endpoint,
    ep.count,
    ep.avgDuration,
    ep.minDuration,
    ep.maxDuration,
    ep.p95Duration,
    ep.lastRequest
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

// Fonction pour envoyer des notifications
async function sendNotifications(alerts: any[], notifications: any) {
  try {
    // Webhook
    if (notifications.webhook) {
      await fetch(notifications.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alerts,
          timestamp: new Date().toISOString(),
          source: 'ecommerce-dashboard'
        })
      });
    }

    // Email (intégration avec un service d'email)
    if (notifications.email) {
      // Ici, vous pouvez intégrer avec SendGrid, Nodemailer, etc.
      console.log('Email notification would be sent to:', notifications.email);
    }

    // Slack (intégration avec Slack)
    if (notifications.slack) {
      const slackMessage = {
        text: `🚨 Alertes de performance détectées`,
        attachments: alerts.map(alert => ({
          color: alert.severity === 'critical' ? 'danger' : 
                 alert.severity === 'warning' ? 'warning' : 'good',
          fields: [
            {
              title: 'Endpoint',
              value: alert.endpoint,
              short: true
            },
            {
              title: 'Métrique',
              value: `${alert.metric}: ${alert.value}`,
              short: true
            },
            {
              title: 'Message',
              value: alert.message,
              short: false
            }
          ]
        }))
      };

      await fetch(notifications.slack, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }
}