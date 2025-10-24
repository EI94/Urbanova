'use client';

/**
 * 💰 BUDGET & FORNITORI PAGE - DASHBOARD
 * 
 * Gestione budget e fornitori per progetti immobiliari
 * Versione dashboard principale (non specifica per progetto)
 */

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BudgetSuppliersLayout } from '@/modules/budgetSuppliers/components/Layout';

export default function BudgetSuppliersPage() {
  return (
    <DashboardLayout>
      <BudgetSuppliersLayout />
    </DashboardLayout>
  );
}
