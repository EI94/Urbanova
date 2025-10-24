'use client';

/**
 * 💰 BUDGET & FORNITORI PAGE
 * 
 * Gestione budget e fornitori per progetti immobiliari
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
