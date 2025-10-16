// 📊 API ROUTE - Admin OS Metrics
// Returns aggregated metrics for dashboard

import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '@/os2/telemetry/metrics';

export async function GET(request: NextRequest) {
  try {
    const metrics = getMetrics();
    
    // Get summary (6 KPI)
    const summary = metrics.getOsSummary();
    
    // Get skill breakdown
    const skills = metrics.getSkillMetrics();
    
    // Get extended metrics
    const extended = metrics.getExtendedMetrics();
    
    return NextResponse.json({
      success: true,
      summary,
      skills,
      extended,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error getting OS metrics:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load metrics',
    }, { status: 500 });
  }
}

