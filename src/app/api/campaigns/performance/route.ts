// API to fetch performance data over time for charts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30';
    const days = parseInt(timeRange);
    
    // Generate time series data for charts
    const performanceData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic data with trends
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseMultiplier = isWeekend ? 0.7 : 1.0;
      const randomFactor = 0.8 + Math.random() * 0.4;
      
      performanceData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        impressions: Math.floor(25000 * baseMultiplier * randomFactor),
        clicks: Math.floor(1500 * baseMultiplier * randomFactor),
        conversions: Math.floor(75 * baseMultiplier * randomFactor),
        cost: parseFloat((1200 * baseMultiplier * randomFactor).toFixed(2)),
        conversionsValue: parseFloat((3750 * baseMultiplier * randomFactor).toFixed(2)),
        ctr: parseFloat((5.5 + Math.random() * 2).toFixed(2)),
        cpc: parseFloat((0.75 + Math.random() * 0.3).toFixed(2)),
        roas: parseFloat((2.8 + Math.random() * 1.5).toFixed(2)),
        qualityScore: Math.floor(6 + Math.random() * 3),
        
        // Hourly data for heatmap
        hourlyData: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          impressions: Math.floor(1000 * (hour >= 8 && hour <= 20 ? 1.5 : 0.5) * randomFactor),
          clicks: Math.floor(60 * (hour >= 8 && hour <= 20 ? 1.5 : 0.5) * randomFactor),
          conversions: Math.floor(3 * (hour >= 8 && hour <= 20 ? 1.5 : 0.5) * randomFactor),
        }))
      });
    }
    
    return NextResponse.json({
      success: true,
      data: performanceData,
      timeRange: days
    });
    
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch performance data',
      data: []
    }, { status: 500 });
  }
}

