import { NextRequest, NextResponse } from 'next/server';

import { dashboardService } from '@/lib/dashboardService';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Dashboard API] Inizializzazione dati dashboard...');

    // Inizializza i dati della dashboard
    await dashboardService.initializeDashboardData();

    // Ottieni le statistiche aggiornate
    const stats = await dashboardService.getDashboardStats();

    console.log('✅ [Dashboard API] Dashboard inizializzata con successo:', {
      totalProjects: stats.totalProjects,
      activeProjects: stats.activeProjects,
      totalBudget: stats.totalBudget,
      averageROI: stats.averageROI,
    });

    return NextResponse.json({
      success: true,
      message: 'Dashboard inizializzata con successo',
      stats: {
        totalProjects: stats.totalProjects,
        activeProjects: stats.activeProjects,
        totalBudget: stats.totalBudget,
        averageROI: stats.averageROI,
        projectsByType: stats.projectsByType,
        projectsByStatus: stats.projectsByStatus,
      },
    });
  } catch (error) {
    console.error('❌ [Dashboard API] Errore inizializzazione dashboard:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Impossibile inizializzare la dashboard',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('📊 [Dashboard API] Recupero statistiche dashboard...');

    // Ottieni le statistiche attuali
    const stats = await dashboardService.getDashboardStats();

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects: stats.totalProjects,
        activeProjects: stats.activeProjects,
        totalBudget: stats.totalBudget,
        averageROI: stats.averageROI,
        projectsByType: stats.projectsByType,
        projectsByStatus: stats.projectsByStatus,
        recentActivities: stats.recentActivities.slice(0, 5),
        topPerformers: stats.topPerformers.slice(0, 3),
        financialSummary: {
          totalInvestment: stats.financialSummary.totalInvestment,
          totalRevenue: stats.financialSummary.totalRevenue,
          totalProfit: stats.financialSummary.totalProfit,
          averageMargin: stats.financialSummary.averageMargin,
        },
      },
    });
  } catch (error) {
    console.error('❌ [Dashboard API] Errore recupero statistiche:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Impossibile recuperare le statistiche della dashboard',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}
