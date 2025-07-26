import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Données de test simples
    const mockData = {
      metrics: [
        {
          name: 'api_requests_total',
          value: 150,
          timestamp: Date.now(),
          type: 'counter'
        }
      ],
      events: [
        {
          type: 'api_request',
          data: { method: 'GET', url: '/api/test' },
          timestamp: Date.now()
        }
      ],
      stats: {
        totalEvents: 1,
        totalMetrics: 1,
        errorRate: 0,
        averageResponseTime: 120
      }
    };

    switch (type) {
      case 'metrics':
        return NextResponse.json(mockData.metrics);
      case 'events':
        return NextResponse.json(mockData.events);
      case 'stats':
        return NextResponse.json(mockData.stats);
      default:
        return NextResponse.json(mockData);
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'cleanup':
        return NextResponse.json({ success: true, message: 'Cleanup completed' });
      case 'export':
        return NextResponse.json({ data: 'exported_data', timestamp: Date.now() });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}