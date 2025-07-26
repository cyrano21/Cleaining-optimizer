import { useState, useEffect, useCallback } from 'react';

export interface AnalyticsOverview {
  totalVisitors: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface DeviceStats {
  device: string;
  users: number;
  percentage: number;
}

export interface TopPage {
  page: string;
  views: number;
  uniqueVisitors: number;
}

export interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface RevenueChart {
  labels: string[];
  data: number[];
  orders: number[];
}

export interface GrowthStats {
  users: {
    total: number;
    new: number;
    active: number;
    growthRate: number;
  };
  orders: {
    total: number;
    thisPeriod: number;
    avgOrderValue: number;
  };
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  traffic: TrafficSource[];
  devices: DeviceStats[];
  topPages: TopPage[];
  topProducts: TopProduct[];
  revenueChart: RevenueChart;
  growth: GrowthStats;
}

export interface AnalyticsMeta {
  period: string;
  startDate: string;
  endDate: string;
  lastUpdated: string;
}

export interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  meta: AnalyticsMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setPeriod: (period: string) => void;
}

export const useAnalytics = (initialPeriod: string = 'month'): UseAnalyticsReturn => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [meta, setMeta] = useState<AnalyticsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(initialPeriod);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des analytics');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setMeta(result.meta);
      } else {
        throw new Error(result.error || 'Erreur dans la réponse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors du chargement des analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refetch = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    meta,
    loading,
    error,
    refetch,
    setPeriod
  };
};
