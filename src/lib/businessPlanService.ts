/**
 * 🏦 BUSINESS PLAN SERVICE - CALCOLI FINANZIARI AVANZATI
 * 
 * Sistema completo per analisi finanziaria immobiliare con:
 * - Cash Flow per periodi discreti (t0, t1, t2...)
 * - Metriche: VAN, TIR, Payback, DSCR, LTV, LTC
 * - Scenari multipli (Cash, Permuta, Pagamento Differito)
 * - Sensitivity Analysis (prezzi, costi, tassi, tempi)
 * - Leve di Negoziazione automatiche
 * - Spiegabilità per ogni metrica
 */

import { addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { notificationTriggerService } from './notificationTriggerService';
import { safeCollection } from './firebaseUtils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BusinessPlanInput {
  // Progetto base
  projectId?: string;
  projectName: string;
  location: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';
  totalUnits: number;
  
  // Ricavi
  averagePrice: number; // Prezzo medio per unità
  unitMix?: { type: string; count: number; price: number }[];
  salesCalendar: { period: string; units: number }[]; // es. [{period: 't1', units: 1}, {period: 't2', units: 3}]
  discounts?: number; // % sconto medio
  salesCommission: number; // % commissione vendita
  
  // Costi diretti
  constructionCostPerUnit?: number; // Costo costruzione per unità
  constructionCostPerSqm?: number; // Oppure €/mq
  averageUnitSize?: number; // mq medi per calcolo da €/mq
  contingency: number; // % contingenze
  
  // Costi indiretti
  softCostPercentage: number; // % per progettazione, DL, sicurezza
  developmentCharges: number; // Oneri di urbanizzazione (€/mq o valore fisso)
  utilities: number; // Allacci
  
  // Terreno - Configurabile per scenario
  landScenarios: LandScenario[];
  
  // Finanza
  discountRate: number; // Tasso di sconto per VAN
  costOfCapital?: number; // Costo del capitale
  debt?: DebtConfiguration;
  
  // Tempi
  constructionTimeline: { phase: string; period: string }[]; // es. [{phase: 'Fondazioni', period: 't1'}]
  permitDelay?: number; // Mesi di ritardo permessi
  
  // Fiscalità (semplificata)
  vatOnLand?: number; // % IVA su terreno
  taxOnProfit?: number; // % imposte su utile
  
  // Target e soglie
  targetMargin?: number; // % margine target
  minimumDSCR?: number; // DSCR minimo accettabile (default 1.2)
}

export interface LandScenario {
  id: string;
  name: string; // es. "S1: Cash", "S2: Permuta", "S3: Pagamento Differito"
  type: 'CASH' | 'PERMUTA' | 'DEFERRED_PAYMENT' | 'MIXED' | 'EARN_OUT' | 'OPTION';
  
  // Cash upfront
  upfrontPayment?: number;
  
  // Permuta
  unitsInPermuta?: number;
  cashContribution?: number;
  cashContributionPeriod?: string; // es. 't2'
  
  // Pagamento differito
  deferredPayment?: number;
  deferredPaymentPeriod?: string; // es. 't1'
  
  // Earn-out
  earnOutPercentage?: number; // % su extra-prezzo
  earnOutThreshold?: number; // Soglia prezzo per attivazione
  
  // Opzione
  optionFee?: number;
  optionExercisePeriod?: string;
  optionExercisePrice?: number;
}

export interface DebtConfiguration {
  ltvTarget?: number; // Loan-to-Value target %
  ltcTarget?: number; // Loan-to-Cost target %
  interestRate: number; // Tasso interesse %
  interestOnlyPeriod?: number; // Mesi solo interessi
  fees: number; // Fees iniziali
  gracePeriod?: number; // Mesi di grazia
  amortizationMonths?: number; // Mesi ammortamento
}

export interface BusinessPlanOutput {
  scenarioId: string;
  scenarioName: string;
  
  // Riepilogo
  summary: {
    totalRevenue: number;
    totalCosts: number;
    profit: number;
    marginPercentage: number;
  };
  
  // Metriche finanziarie
  metrics: {
    npv: number; // VAN - Net Present Value
    irr: number; // TIR - Internal Rate of Return
    payback: number; // Anni per payback
    dscr: {
      min: number;
      average: number;
      byPeriod: { period: string; dscr: number }[];
    };
    ltv: number; // Loan-to-Value a closing
    ltc: number; // Loan-to-Cost a peak capex
  };
  
  // Cash Flow per periodo
  cashFlow: CashFlowPeriod[];
  
  // Assunzioni chiave
  keyAssumptions: string[];
  
  // Alert e warning
  alerts: Alert[];
  
  // Leve di negoziazione
  negotiationLevers: NegotiationLever[];
  
  // Spiegazioni metriche
  explanations: { [metric: string]: string };
}

export interface CashFlowPeriod {
  period: string; // t0, t1, t2...
  months: number; // Mesi dall'inizio
  
  // Entrate
  revenue: number; // Ricavi vendite
  
  // Uscite
  constructionCost: number;
  softCosts: number;
  landPayment: number;
  interestAndFees: number;
  
  // Netto
  netCashFlow: number;
  cumulativeCashFlow: number;
  
  // Debito (se presente)
  debtDrawdown?: number;
  debtRepayment?: number;
  debtBalance?: number;
}

export interface Alert {
  type: 'WARNING' | 'ERROR' | 'INFO';
  category: 'VAN' | 'TIR' | 'MARGIN' | 'DSCR' | 'LIQUIDITY' | 'PRICING' | 'ASSUMPTIONS';
  message: string;
  impact: string; // Breve descrizione dell'impatto
  recommendation?: string; // Raccomandazione per risolvere
}

export interface NegotiationLever {
  type: 'CASH_CONTRIBUTION' | 'DEFERRED_PAYMENT' | 'LAND_DISCOUNT' | 'MIXED' | 'TIMING';
  description: string;
  currentValue: number;
  targetValue: number;
  deltaImpact: number; // Impatto su VAN/Margine
  explanation: string; // Spiegazione a parole (max 140 caratteri)
}

export interface SensitivityInput {
  baseScenarioId: string;
  variables: {
    prices?: number[]; // es. [-15, -10, -5, 0, 5, 10, 15] in %
    costs?: number[]; // es. [-10, -5, 0, 5, 10, 15] in %
    interestRate?: number[]; // es. [6, 8, 10, 12, 14, 16, 20] in %
    salesDelay?: number[]; // es. [0, 6, 12] in mesi
    cashContribution?: number[]; // es. [0, 50000, 100000, 150000, 200000]
    deferredPayment?: number[]; // es. [200000, 250000, 300000, 350000, 400000]
  };
}

export interface SensitivityOutput {
  variable: string;
  values: {
    value: number;
    npv: number;
    irr: number;
    margin: number;
    dscr: number;
  }[];
  breakEvenPoint?: {
    value: number;
    description: string;
  };
}

export interface ScenarioComparison {
  scenarios: BusinessPlanOutput[];
  ranking: {
    scenarioId: string;
    rank: number;
    score: number; // Score combinato basato su VAN, TIR, Margine, DSCR
  }[];
  recommendations: string[];
  equivalencePoints: {
    fromScenario: string;
    toScenario: string;
    lever: string;
    requiredValue: number;
    explanation: string;
  }[];
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class BusinessPlanService {
  private readonly COLLECTION_NAME = 'feasibilityProjects' // TEMPORANEO: usa collezione che funziona;
  
  /**
   * 🎯 CALCOLO BUSINESS PLAN COMPLETO
   */
  async calculateBusinessPlan(input: BusinessPlanInput): Promise<BusinessPlanOutput[]> {
    console.log('📊 [BusinessPlan] Calcolo Business Plan per:', input.projectName);
    
    const results: BusinessPlanOutput[] = [];
    
    // Calcola un output per ogni scenario terreno
    for (const landScenario of input.landScenarios) {
      console.log(`📊 [BusinessPlan] Calcolando scenario: ${landScenario.name}`);
      
      const output = await this.calculateScenario(input, landScenario);
      results.push(output);
    }
    
    console.log(`✅ [BusinessPlan] Calcolati ${results.length} scenari`);
    return results;
  }
  
  /**
   * 📈 CALCOLO SINGOLO SCENARIO
   */
  private async calculateScenario(
    input: BusinessPlanInput,
    landScenario: LandScenario
  ): Promise<BusinessPlanOutput> {
    // 1. Calcola ricavi totali
    const totalRevenue = this.calculateTotalRevenue(input);
    
    // 2. Calcola costi totali
    const totalCosts = this.calculateTotalCosts(input, landScenario);
    
    // 3. Calcola utile e margine
    const profit = totalRevenue - totalCosts;
    const marginPercentage = (profit / totalRevenue) * 100;
    
    // 4. Genera cash flow per periodo
    const cashFlow = this.generateCashFlow(input, landScenario, totalRevenue, totalCosts);
    
    // 5. Calcola VAN
    const npv = this.calculateNPV(cashFlow, input.discountRate);
    
    // 6. Calcola TIR
    const irr = this.calculateIRR(cashFlow);
    
    // 7. Calcola Payback
    const payback = this.calculatePayback(cashFlow);
    
    // 8. Calcola DSCR (se c'è debito)
    const dscr = input.debt 
      ? this.calculateDSCR(cashFlow, input.debt)
      : { min: 999, average: 999, byPeriod: [] };
    
    // 9. Calcola LTV e LTC
    const { ltv, ltc } = input.debt
      ? this.calculateLeverageMetrics(input, totalCosts, totalRevenue)
      : { ltv: 0, ltc: 0 };
    
    // 10. Genera assunzioni chiave
    const keyAssumptions = this.generateKeyAssumptions(input, landScenario);
    
    // 11. Genera alert
    const alerts = this.generateAlerts(input, {
      npv,
      irr,
      marginPercentage,
      dscr: dscr.min,
      cashFlow
    });
    
    // 12. Genera leve di negoziazione
    const negotiationLevers = this.generateNegotiationLevers(input, landScenario, {
      npv,
      marginPercentage,
      totalRevenue,
      totalCosts
    });
    
    // 13. Genera spiegazioni
    const explanations = this.generateExplanations({
      npv,
      irr,
      payback,
      dscr: dscr.min,
      ltv,
      ltc,
      marginPercentage
    });
    
    return {
      scenarioId: landScenario.id,
      scenarioName: landScenario.name,
      summary: {
        totalRevenue,
        totalCosts,
        profit,
        marginPercentage
      },
      metrics: {
        npv,
        irr,
        payback,
        dscr,
        ltv,
        ltc
      },
      cashFlow,
      keyAssumptions,
      alerts,
      negotiationLevers,
      explanations
    };
  }
  
  /**
   * 💰 CALCOLO RICAVI TOTALI
   */
  private calculateTotalRevenue(input: BusinessPlanInput): number {
    let totalRevenue = 0;
    
    if (input.unitMix && input.unitMix.length > 0) {
      // Usa mix unità se fornito
      totalRevenue = input.unitMix.reduce((sum, unit) => {
        return sum + (unit.count * unit.price);
      }, 0);
    } else {
      // Usa prezzo medio per tutte le unità
      totalRevenue = input.totalUnits * input.averagePrice;
    }
    
    // Applica sconti se presenti
    if (input.discounts && input.discounts > 0) {
      totalRevenue = totalRevenue * (1 - input.discounts / 100);
    }
    
    // Sottrai commissioni vendita
    totalRevenue = totalRevenue * (1 - input.salesCommission / 100);
    
    return totalRevenue;
  }
  
  /**
   * 💸 CALCOLO COSTI TOTALI
   */
  private calculateTotalCosts(input: BusinessPlanInput, landScenario: LandScenario): number {
    let totalCosts = 0;
    
    // 1. Costi diretti costruzione
    let constructionCost = 0;
    if (input.constructionCostPerUnit) {
      constructionCost = input.totalUnits * input.constructionCostPerUnit;
    } else if (input.constructionCostPerSqm && input.averageUnitSize) {
      constructionCost = input.totalUnits * input.averageUnitSize * input.constructionCostPerSqm;
    }
    
    // Aggiungi contingenze
    constructionCost = constructionCost * (1 + input.contingency / 100);
    totalCosts += constructionCost;
    
    // 2. Costi indiretti (soft costs)
    const softCosts = constructionCost * (input.softCostPercentage / 100);
    totalCosts += softCosts;
    
    // 3. Oneri e allacci
    totalCosts += input.developmentCharges;
    totalCosts += input.utilities;
    
    // 4. Costo terreno (dipende da scenario)
    const landCost = this.calculateLandCost(input, landScenario);
    totalCosts += landCost;
    
    // 5. Costi finanziari (se c'è debito)
    if (input.debt) {
      const financeCosts = this.calculateFinanceCosts(input.debt, totalCosts);
      totalCosts += financeCosts;
    }
    
    return totalCosts;
  }
  
  /**
   * 🏞️ CALCOLO COSTO TERRENO
   */
  private calculateLandCost(input: BusinessPlanInput, landScenario: LandScenario): number {
    let landCost = 0;
    
    switch (landScenario.type) {
      case 'CASH':
        landCost = landScenario.upfrontPayment || 0;
        break;
        
      case 'PERMUTA':
        // Costo = valore unità in permuta (a prezzo netto) + eventuale contributo cash
        let netPricePermuta = input.averagePrice;
        if (input.discounts && input.discounts > 0) {
          netPricePermuta = netPricePermuta * (1 - input.discounts / 100);
        }
        if (input.salesCommission && input.salesCommission > 0) {
          netPricePermuta = netPricePermuta * (1 - input.salesCommission / 100);
        }
        const permutaValue = (landScenario.unitsInPermuta || 0) * netPricePermuta;
        const cashContribution = landScenario.cashContribution || 0;
        landCost = permutaValue + cashContribution;
        break;
        
      case 'DEFERRED_PAYMENT':
        // Attualizza il pagamento differito
        const deferredPayment = landScenario.deferredPayment || 0;
        const periodIndex = this.getPeriodIndex(landScenario.deferredPaymentPeriod || 't1');
        const discountFactor = Math.pow(1 + input.discountRate / 100, -periodIndex);
        landCost = deferredPayment * discountFactor; // Valore attuale
        break;
        
      case 'MIXED':
        // Combinazione di permuta + pagamento differito
        const permutaValueMixed = (landScenario.unitsInPermuta || 0) * input.averagePrice;
        const deferredMixed = landScenario.deferredPayment || 0;
        const periodIndexMixed = this.getPeriodIndex(landScenario.deferredPaymentPeriod || 't1');
        const discountFactorMixed = Math.pow(1 + input.discountRate / 100, -periodIndexMixed);
        landCost = permutaValueMixed + (deferredMixed * discountFactorMixed);
        break;
        
      case 'EARN_OUT':
        // Base upfront + earn-out stimato
        landCost = landScenario.upfrontPayment || 0;
        // Earn-out viene calcolato dinamicamente in base ai risultati effettivi
        break;
        
      case 'OPTION':
        // Fee opzione + prezzo esercizio (attualizzato)
        const optionFee = landScenario.optionFee || 0;
        const exercisePrice = landScenario.optionExercisePrice || 0;
        const exercisePeriodIndex = this.getPeriodIndex(landScenario.optionExercisePeriod || 't1');
        const exerciseDiscountFactor = Math.pow(1 + input.discountRate / 100, -exercisePeriodIndex);
        landCost = optionFee + (exercisePrice * exerciseDiscountFactor);
        break;
    }
    
    // Applica IVA se presente
    if (input.vatOnLand && input.vatOnLand > 0) {
      landCost = landCost * (1 + input.vatOnLand / 100);
    }
    
    return landCost;
  }
  
  /**
   * 💳 CALCOLO COSTI FINANZIARI
   */
  private calculateFinanceCosts(debt: DebtConfiguration, totalCosts: number): number {
    // Stima semplificata: fees + interessi intercalari su ~50% del periodo costruzione
    const loanAmount = totalCosts * ((debt.ltvTarget || debt.ltcTarget || 70) / 100);
    const fees = loanAmount * (debt.fees / 100);
    
    // Interessi intercalari stimati (12 mesi in media su 50% del loan)
    const avgBalance = loanAmount / 2;
    const months = 12;
    const intercalaryInterest = (avgBalance * debt.interestRate / 100) * (months / 12);
    
    return fees + intercalaryInterest;
  }
  
  /**
   * 📅 GENERAZIONE CASH FLOW PER PERIODO
   */
  private generateCashFlow(
    input: BusinessPlanInput,
    landScenario: LandScenario,
    totalRevenue: number,
    totalCosts: number
  ): CashFlowPeriod[] {
    const periods: CashFlowPeriod[] = [];
    const maxPeriod = this.getMaxPeriod(input.salesCalendar, input.constructionTimeline);
    
    let cumulativeCashFlow = 0;
    let debtBalance = 0;
    
    // Calcola loan amount se c'è debito
    const loanAmount = input.debt 
      ? totalCosts * ((input.debt.ltvTarget || input.debt.ltcTarget || 0) / 100)
      : 0;
    
    for (let i = 0; i <= maxPeriod; i++) {
      const periodName = i === 0 ? 't0' : `t${i}`;
      
      // Ricavi (vendite del periodo) - con commissioni e sconti già applicati
      const revenue = this.getRevenueForPeriod(
        input.salesCalendar, 
        periodName, 
        input.averagePrice,
        input.salesCommission,
        input.discounts
      );
      
      // Costi costruzione del periodo
      const constructionCost = this.getConstructionCostForPeriod(
        input.constructionTimeline,
        periodName,
        totalCosts
      );
      
      // Soft costs proporzionali
      const softCosts = constructionCost * (input.softCostPercentage / 100);
      
      // Pagamento terreno (se in questo periodo)
      const landPayment = this.getLandPaymentForPeriod(
        landScenario, 
        periodName, 
        input.averagePrice,
        input.salesCommission || 0,
        input.discounts || 0
      );
      
      // Interessi e fees
      let interestAndFees = 0;
      let debtDrawdown = 0;
      let debtRepayment = 0;
      
      if (input.debt && loanAmount > 0) {
        // Drawdown debito se necessario per coprire costi
        const periodCosts = constructionCost + softCosts + landPayment;
        if (periodCosts > revenue && debtBalance < loanAmount) {
          debtDrawdown = Math.min(periodCosts - revenue, loanAmount - debtBalance);
          debtBalance += debtDrawdown;
        }
        
        // Calcola interessi sul saldo debito
        interestAndFees = (debtBalance * input.debt.interestRate / 100) * (12 / 12); // annuale
        
        // Rimborso debito se ci sono ricavi in eccesso
        if (revenue > periodCosts + interestAndFees && debtBalance > 0) {
          debtRepayment = Math.min(revenue - periodCosts - interestAndFees, debtBalance);
          debtBalance -= debtRepayment;
        }
      }
      
      // Cash flow netto del periodo
      const netCashFlow = revenue - constructionCost - softCosts - landPayment - interestAndFees;
      cumulativeCashFlow += netCashFlow;
      
      periods.push({
        period: periodName,
        months: i * 12,
        revenue,
        constructionCost,
        softCosts,
        landPayment,
        interestAndFees,
        netCashFlow,
        cumulativeCashFlow,
        debtDrawdown: input.debt ? debtDrawdown : undefined,
        debtRepayment: input.debt ? debtRepayment : undefined,
        debtBalance: input.debt ? debtBalance : undefined
      });
    }
    
    return periods;
  }
  
  /**
   * 📊 CALCOLO VAN (Net Present Value)
   */
  private calculateNPV(cashFlow: CashFlowPeriod[], discountRate: number): number {
    let npv = 0;
    
    for (const period of cashFlow) {
      const periodIndex = this.getPeriodIndex(period.period);
      const discountFactor = Math.pow(1 + discountRate / 100, -periodIndex);
      
      // t0 non viene scontato
      if (periodIndex === 0) {
        npv += period.netCashFlow;
      } else {
        npv += period.netCashFlow * discountFactor;
      }
    }
    
    return npv;
  }
  
  /**
   * 📊 CALCOLO TIR (Internal Rate of Return)
   */
  private calculateIRR(cashFlow: CashFlowPeriod[]): number {
    // Implementazione Newton-Raphson per trovare IRR
    const cashFlows = cashFlow.map(cf => cf.netCashFlow);
    
    let rate = 0.1; // Guess iniziale 10%
    const maxIterations = 100;
    const tolerance = 0.0001;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let t = 0; t < cashFlows.length; t++) {
        const factor = Math.pow(1 + rate, -t);
        npv += cashFlows[t] * factor;
        dnpv -= t * cashFlows[t] * factor / (1 + rate);
      }
      
      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100; // Ritorna in percentuale
      }
      
      rate = newRate;
    }
    
    // Se non converge, ritorna 0
    return 0;
  }
  
  /**
   * 📊 CALCOLO PAYBACK
   */
  private calculatePayback(cashFlow: CashFlowPeriod[]): number {
    let cumulativeCF = 0;
    
    for (let i = 0; i < cashFlow.length; i++) {
      cumulativeCF += cashFlow[i].netCashFlow;
      
      if (cumulativeCF >= 0) {
        // Interpolazione lineare per anno esatto
        const prevCumulativeCF = cumulativeCF - cashFlow[i].netCashFlow;
        
        // Safety check per divisione per zero
        if (cashFlow[i].netCashFlow === 0) {
          return i;
        }
        
        const fraction = Math.abs(prevCumulativeCF) / Math.abs(cashFlow[i].netCashFlow);
        return i + fraction;
      }
    }
    
    // Se non raggiunge mai break-even
    return 999;
  }
  
  /**
   * 📊 CALCOLO DSCR (Debt Service Coverage Ratio)
   */
  private calculateDSCR(
    cashFlow: CashFlowPeriod[],
    debt: DebtConfiguration
  ): { min: number; average: number; byPeriod: { period: string; dscr: number }[] } {
    const dscrs: { period: string; dscr: number }[] = [];
    
    for (const period of cashFlow) {
      // CFADS = Cash Flow Available for Debt Service
      const cfads = period.netCashFlow + (period.interestAndFees || 0);
      
      // Debt Service = Interest + Principal Repayment
      const debtService = (period.interestAndFees || 0) + (period.debtRepayment || 0);
      
      if (debtService > 0) {
        const dscr = cfads / debtService;
        dscrs.push({ period: period.period, dscr });
      }
    }
    
    if (dscrs.length === 0) {
      return { min: 999, average: 999, byPeriod: [] };
    }
    
    const min = Math.min(...dscrs.map(d => d.dscr));
    const average = dscrs.reduce((sum, d) => sum + d.dscr, 0) / dscrs.length;
    
    return { min, average, byPeriod: dscrs };
  }
  
  /**
   * 📊 CALCOLO LTV E LTC
   */
  private calculateLeverageMetrics(
    input: BusinessPlanInput,
    totalCosts: number,
    totalRevenue: number
  ): { ltv: number; ltc: number } {
    if (!input.debt) {
      return { ltv: 0, ltc: 0 };
    }
    
    const loanAmount = totalCosts * ((input.debt.ltvTarget || input.debt.ltcTarget || 0) / 100);
    
    // LTV = Loan / Value (valore immobiliare al completamento)
    const ltv = (loanAmount / totalRevenue) * 100;
    
    // LTC = Loan / Total Costs
    const ltc = (loanAmount / totalCosts) * 100;
    
    return { ltv, ltc };
  }
  
  /**
   * 📝 GENERAZIONE ASSUNZIONI CHIAVE
   */
  private generateKeyAssumptions(input: BusinessPlanInput, landScenario: LandScenario): string[] {
    const assumptions: string[] = [];
    
    assumptions.push(`${input.totalUnits} unità a prezzo medio €${this.formatNumber(input.averagePrice)}/unità`);
    assumptions.push(`Costi costruzione €${this.formatNumber(input.constructionCostPerUnit || 0)}/unità + ${input.contingency}% contingenze`);
    assumptions.push(`Soft costs ${input.softCostPercentage}%, commissioni vendita ${input.salesCommission}%`);
    assumptions.push(`Tasso sconto ${input.discountRate}% per VAN`);
    
    // Assunzione scenario terreno
    if (landScenario.type === 'CASH') {
      assumptions.push(`Terreno: €${this.formatNumber(landScenario.upfrontPayment || 0)} cash upfront`);
    } else if (landScenario.type === 'PERMUTA') {
      assumptions.push(`Terreno: ${landScenario.unitsInPermuta} unità in permuta + €${this.formatNumber(landScenario.cashContribution || 0)} contributo a ${landScenario.cashContributionPeriod}`);
    } else if (landScenario.type === 'DEFERRED_PAYMENT') {
      assumptions.push(`Terreno: €${this.formatNumber(landScenario.deferredPayment || 0)} pagamento differito a ${landScenario.deferredPaymentPeriod}`);
    }
    
    if (input.debt) {
      assumptions.push(`Debito: LTV ${input.debt.ltvTarget || input.debt.ltcTarget}% al ${input.debt.interestRate}% + ${input.debt.fees}% fees`);
    }
    
    // Calendario vendite
    const salesSummary = input.salesCalendar.map(s => `${s.units} a ${s.period}`).join(', ');
    assumptions.push(`Calendario vendite: ${salesSummary}`);
    
    return assumptions;
  }
  
  /**
   * ⚠️ GENERAZIONE ALERT
   */
  private generateAlerts(
    input: BusinessPlanInput,
    metrics: {
      npv: number;
      irr: number;
      marginPercentage: number;
      dscr: number;
      cashFlow: CashFlowPeriod[];
    }
  ): Alert[] {
    const alerts: Alert[] = [];
    
    // Alert VAN negativo
    if (metrics.npv < 0) {
      alerts.push({
        type: 'ERROR',
        category: 'VAN',
        message: `VAN negativo (€${this.formatNumber(metrics.npv)})`,
        impact: 'Il progetto distrugge valore',
        recommendation: 'Rivedi prezzi di vendita, costi costruzione o condizioni terreno'
      });
    }
    
    // Alert TIR sotto tasso di sconto
    if (metrics.irr < input.discountRate) {
      alerts.push({
        type: 'WARNING',
        category: 'TIR',
        message: `TIR (${metrics.irr.toFixed(1)}%) sotto tasso di sconto (${input.discountRate}%)`,
        impact: 'Rendimento inferiore al costo opportunità del capitale',
        recommendation: 'Valuta alternative di investimento o migliora le condizioni'
      });
    }
    
    // Alert margine sotto target
    if (input.targetMargin && metrics.marginPercentage < input.targetMargin) {
      alerts.push({
        type: 'WARNING',
        category: 'MARGIN',
        message: `Margine (${metrics.marginPercentage.toFixed(1)}%) sotto target (${input.targetMargin}%)`,
        impact: 'Margini non sufficienti per coprire rischi',
        recommendation: 'Aumenta prezzi di vendita o riduci costi'
      });
    }
    
    // Alert DSCR < 1
    if (input.debt && metrics.dscr < (input.minimumDSCR || 1.2)) {
      alerts.push({
        type: 'ERROR',
        category: 'DSCR',
        message: `DSCR minimo (${metrics.dscr.toFixed(2)}) sotto soglia ${input.minimumDSCR || 1.2}`,
        impact: 'La banca potrebbe non finanziare il progetto',
        recommendation: 'Aumenta equity, ridimensiona debito o migliora cash flow'
      });
    }
    
    // Alert concentrazione vendite
    const salesConcentration = this.checkSalesConcentration(metrics.cashFlow);
    if (salesConcentration.isConcentrated) {
      alerts.push({
        type: 'WARNING',
        category: 'LIQUIDITY',
        message: `Vendite concentrate in ${salesConcentration.period}`,
        impact: 'Rischio liquidità elevato se le vendite slittano',
        recommendation: 'Anticipa vendite, prevedi bridge financing o distribuisci timeline'
      });
    }
    
    // Alert pricing aggressivo
    const marketAverage = 2500; // TODO: Prendere da market data reali
    if (input.averagePrice > marketAverage * 1.15) {
      alerts.push({
        type: 'WARNING',
        category: 'PRICING',
        message: `Prezzo medio €${this.formatNumber(input.averagePrice)} superiore del ${((input.averagePrice / marketAverage - 1) * 100).toFixed(0)}% alla media di mercato`,
        impact: 'Rischio di invenduto o tempi di vendita allungati',
        recommendation: 'Valuta sensitivity su prezzi -10% / -15%'
      });
    }
    
    return alerts;
  }
  
  /**
   * 🎯 GENERAZIONE LEVE DI NEGOZIAZIONE
   */
  private generateNegotiationLevers(
    input: BusinessPlanInput,
    landScenario: LandScenario,
    metrics: {
      npv: number;
      marginPercentage: number;
      totalRevenue: number;
      totalCosts: number;
    }
  ): NegotiationLever[] {
    const levers: NegotiationLever[] = [];
    
    // Leva 1: Contributo permuta necessario
    if (landScenario.type === 'PERMUTA') {
      const currentContribution = landScenario.cashContribution || 0;
      
      // Calcola contributo target per migliorare VAN del 10%
      const targetNPV = metrics.npv * 1.1;
      const deltaNPV = targetNPV - metrics.npv;
      const targetContribution = currentContribution + deltaNPV;
      
      levers.push({
        type: 'CASH_CONTRIBUTION',
        description: `Contributo cash in permuta per raggiungere VAN €${this.formatNumber(targetNPV)}`,
        currentValue: currentContribution,
        targetValue: targetContribution,
        deltaImpact: deltaNPV,
        explanation: `+€${this.formatNumber(targetContribution - currentContribution)} contributo → VAN +${this.formatNumber(deltaNPV)}`
      });
    }
    
    // Leva 2: Pagamento differito ottimale
    if (landScenario.type === 'DEFERRED_PAYMENT') {
      const currentPayment = landScenario.deferredPayment || 0;
      
      // Calcola riduzione necessaria per pareggiare best scenario
      const targetPayment = currentPayment * 0.9; // -10%
      const deltaImpact = (currentPayment - targetPayment);
      
      levers.push({
        type: 'DEFERRED_PAYMENT',
        description: `Riduzione pagamento differito per migliorare cash flow`,
        currentValue: currentPayment,
        targetValue: targetPayment,
        deltaImpact: deltaImpact,
        explanation: `-€${this.formatNumber(deltaImpact)} pagamento → Cassa +${this.formatNumber(deltaImpact)}`
      });
    }
    
    // Leva 3: Sconto terreno equivalente
    const landCost = this.calculateLandCost(input, landScenario);
    const targetLandCost = landCost * 0.95; // -5%
    const landDiscount = landCost - targetLandCost;
    
    levers.push({
      type: 'LAND_DISCOUNT',
      description: `Sconto su prezzo terreno per migliorare marginalità`,
      currentValue: landCost,
      targetValue: targetLandCost,
      deltaImpact: landDiscount,
      explanation: `-${((landDiscount / landCost) * 100).toFixed(1)}% terreno → Margine +${((landDiscount / metrics.totalRevenue) * 100).toFixed(1)}pt`
    });
    
    // Leva 4: Timing pagamento (per pagamenti differiti)
    if (landScenario.type === 'DEFERRED_PAYMENT' && landScenario.deferredPaymentPeriod) {
      const currentPeriod = this.getPeriodIndex(landScenario.deferredPaymentPeriod);
      const delayedPeriod = currentPeriod + 1;
      
      const currentPV = (landScenario.deferredPayment || 0) / Math.pow(1 + input.discountRate / 100, currentPeriod);
      const delayedPV = (landScenario.deferredPayment || 0) / Math.pow(1 + input.discountRate / 100, delayedPeriod);
      const timingBenefit = currentPV - delayedPV;
      
      levers.push({
        type: 'TIMING',
        description: `Posticipare pagamento di 1 anno (da t${currentPeriod} a t${delayedPeriod})`,
        currentValue: currentPeriod,
        targetValue: delayedPeriod,
        deltaImpact: timingBenefit,
        explanation: `+12 mesi timing → VAN +€${this.formatNumber(timingBenefit)} (valore tempo del denaro)`
      });
    }
    
    return levers;
  }
  
  /**
   * 💬 GENERAZIONE SPIEGAZIONI METRICHE
   */
  private generateExplanations(metrics: {
    npv: number;
    irr: number;
    payback: number;
    dscr: number;
    ltv: number;
    ltc: number;
    marginPercentage: number;
  }): { [metric: string]: string } {
    return {
      'npv': `VAN €${this.formatNumber(metrics.npv)}: valore attuale netto del progetto scontato al tasso obiettivo. Positivo = crea valore.`,
      'irr': `TIR ${metrics.irr.toFixed(1)}%: rendimento annuo composto dell'investimento. Confronta con costo capitale e alternative.`,
      'payback': `Payback ${metrics.payback.toFixed(1)} anni: tempo per recuperare l'investimento iniziale. Più breve = meno rischio.`,
      'dscr': `DSCR ${metrics.dscr.toFixed(2)}x: quante volte il cash flow copre il servizio del debito. >1.2 è bancabile.`,
      'ltv': `LTV ${metrics.ltv.toFixed(1)}%: rapporto tra loan e valore immobiliare. <75% è conservativo, <80% è standard.`,
      'ltc': `LTC ${metrics.ltc.toFixed(1)}%: rapporto tra loan e costi totali. Indica quanta equity serve in % sui costi.`,
      'margin': `Margine ${metrics.marginPercentage.toFixed(1)}%: utile netto su ricavi. >15% è solido, >20% è eccellente per residenziale.`
    };
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private getPeriodIndex(period: string): number {
    if (period === 't0') return 0;
    const match = period.match(/t(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  private getMaxPeriod(salesCalendar: { period: string; units: number }[], constructionTimeline: { phase: string; period: string }[]): number {
    const salesMax = Math.max(...salesCalendar.map(s => this.getPeriodIndex(s.period)));
    const constructionMax = Math.max(...constructionTimeline.map(c => this.getPeriodIndex(c.period)));
    return Math.max(salesMax, constructionMax);
  }
  
  private getRevenueForPeriod(salesCalendar: { period: string; units: number }[], period: string, averagePrice: number, salesCommission: number = 0, discounts: number = 0): number {
    const sale = salesCalendar.find(s => s.period === period);
    if (!sale) return 0;
    
    let revenue = sale.units * averagePrice;
    
    // Applica sconti se presenti
    if (discounts && discounts > 0) {
      revenue = revenue * (1 - discounts / 100);
    }
    
    // Sottrai commissioni vendita
    if (salesCommission && salesCommission > 0) {
      revenue = revenue * (1 - salesCommission / 100);
    }
    
    return revenue;
  }
  
  private getConstructionCostForPeriod(constructionTimeline: { phase: string; period: string }[], period: string, totalCosts: number): number {
    // Distribuisci costi costruzione proporzionalmente alle fasi in questo periodo
    const phasesInPeriod = constructionTimeline.filter(c => c.period === period);
    const totalPhases = constructionTimeline.length;
    
    if (phasesInPeriod.length === 0) return 0;
    
    // Distribuisci uniformemente (semplificazione)
    return (totalCosts * 0.6) / totalPhases * phasesInPeriod.length; // 60% dei costi sono costruzione
  }
  
  private getLandPaymentForPeriod(landScenario: LandScenario, period: string, averagePrice: number, salesCommission: number = 0, discounts: number = 0): number {
    // Calcola prezzo netto (dopo commissioni e sconti)
    let netPrice = averagePrice;
    if (discounts > 0) netPrice = netPrice * (1 - discounts / 100);
    if (salesCommission > 0) netPrice = netPrice * (1 - salesCommission / 100);
    
    switch (landScenario.type) {
      case 'CASH':
        return period === 't0' ? (landScenario.upfrontPayment || 0) : 0;
        
      case 'PERMUTA':
        // Pagamento permuta + contributo cash nel periodo specificato
        if (period === (landScenario.cashContributionPeriod || 't0')) {
          return (landScenario.cashContribution || 0);
        }
        // Unità in permuta vengono "pagate" con unità (costo opportunità) - usa prezzo netto
        if (period === 't0') {
          return (landScenario.unitsInPermuta || 0) * netPrice;
        }
        return 0;
        
      case 'DEFERRED_PAYMENT':
        return period === landScenario.deferredPaymentPeriod ? (landScenario.deferredPayment || 0) : 0;
        
      default:
        return 0;
    }
  }
  
  private checkSalesConcentration(cashFlow: CashFlowPeriod[]): { isConcentrated: boolean; period: string } {
    const salesByPeriod = cashFlow.map(cf => ({ period: cf.period, revenue: cf.revenue }));
    const totalSales = salesByPeriod.reduce((sum, s) => sum + s.revenue, 0);
    
    for (const sale of salesByPeriod) {
      if (sale.revenue / totalSales > 0.6) { // >60% delle vendite in un periodo
        return { isConcentrated: true, period: sale.period };
      }
    }
    
    return { isConcentrated: false, period: '' };
  }
  
  private formatNumber(num: number): string {
    return new Intl.NumberFormat('it-IT', { 
      maximumFractionDigits: 0 
    }).format(Math.round(num));
  }
  
  // ============================================================================
  // SENSITIVITY ANALYSIS
  // ============================================================================
  
  /**
   * 📊 ANALISI DI SENSIBILITÀ
   */
  async performSensitivityAnalysis(
    input: BusinessPlanInput,
    sensitivityInput: SensitivityInput
  ): Promise<SensitivityOutput[]> {
    console.log('📊 [BusinessPlan] Analisi sensitivity...');
    
    const results: SensitivityOutput[] = [];
    
    // Find base scenario
    const baseScenario = input.landScenarios.find(s => s.id === sensitivityInput.baseScenarioId);
    if (!baseScenario) {
      throw new Error(`Scenario ${sensitivityInput.baseScenarioId} non trovato`);
    }
    
    // Sensitivity su prezzi
    if (sensitivityInput.variables.prices) {
      const priceResults = await this.sensitivityOnPrices(input, baseScenario, sensitivityInput.variables.prices);
      results.push(priceResults);
    }
    
    // Sensitivity su costi
    if (sensitivityInput.variables.costs) {
      const costResults = await this.sensitivityOnCosts(input, baseScenario, sensitivityInput.variables.costs);
      results.push(costResults);
    }
    
    // Sensitivity su tasso
    if (sensitivityInput.variables.interestRate) {
      const rateResults = await this.sensitivityOnRate(input, baseScenario, sensitivityInput.variables.interestRate);
      results.push(rateResults);
    }
    
    // Sensitivity su contributo cash (per permuta)
    if (sensitivityInput.variables.cashContribution && baseScenario.type === 'PERMUTA') {
      const contributionResults = await this.sensitivityOnCashContribution(input, baseScenario, sensitivityInput.variables.cashContribution);
      results.push(contributionResults);
    }
    
    // Sensitivity su pagamento differito
    if (sensitivityInput.variables.deferredPayment && baseScenario.type === 'DEFERRED_PAYMENT') {
      const deferredResults = await this.sensitivityOnDeferredPayment(input, baseScenario, sensitivityInput.variables.deferredPayment);
      results.push(deferredResults);
    }
    
    return results;
  }
  
  private async sensitivityOnPrices(
    input: BusinessPlanInput,
    baseScenario: LandScenario,
    priceDeltas: number[]
  ): Promise<SensitivityOutput> {
    const values: SensitivityOutput['values'] = [];
    
    for (const delta of priceDeltas) {
      const modifiedInput = {
        ...input,
        averagePrice: input.averagePrice * (1 + delta / 100),
        landScenarios: [baseScenario]
      };
      
      const result = await this.calculateScenario(modifiedInput, baseScenario);
      
      values.push({
        value: delta,
        npv: result.metrics.npv,
        irr: result.metrics.irr,
        margin: result.summary.marginPercentage,
        dscr: result.metrics.dscr.min
      });
    }
    
    return {
      variable: 'Prezzi (%)',
      values,
      breakEvenPoint: this.findBreakEven(values, 'npv')
    };
  }
  
  private async sensitivityOnCosts(
    input: BusinessPlanInput,
    baseScenario: LandScenario,
    costDeltas: number[]
  ): Promise<SensitivityOutput> {
    const values: SensitivityOutput['values'] = [];
    
    for (const delta of costDeltas) {
      const modifiedInput = {
        ...input,
        constructionCostPerUnit: (input.constructionCostPerUnit || 0) * (1 + delta / 100),
        landScenarios: [baseScenario]
      };
      
      const result = await this.calculateScenario(modifiedInput, baseScenario);
      
      values.push({
        value: delta,
        npv: result.metrics.npv,
        irr: result.metrics.irr,
        margin: result.summary.marginPercentage,
        dscr: result.metrics.dscr.min
      });
    }
    
    return {
      variable: 'Costi (%)',
      values,
      breakEvenPoint: this.findBreakEven(values, 'npv')
    };
  }
  
  private async sensitivityOnRate(
    input: BusinessPlanInput,
    baseScenario: LandScenario,
    rates: number[]
  ): Promise<SensitivityOutput> {
    const values: SensitivityOutput['values'] = [];
    
    for (const rate of rates) {
      const modifiedInput = {
        ...input,
        discountRate: rate,
        debt: input.debt ? { ...input.debt, interestRate: rate } : undefined,
        landScenarios: [baseScenario]
      };
      
      const result = await this.calculateScenario(modifiedInput, baseScenario);
      
      values.push({
        value: rate,
        npv: result.metrics.npv,
        irr: result.metrics.irr,
        margin: result.summary.marginPercentage,
        dscr: result.metrics.dscr.min
      });
    }
    
    return {
      variable: 'Tasso (%)',
      values
    };
  }
  
  private async sensitivityOnCashContribution(
    input: BusinessPlanInput,
    baseScenario: LandScenario,
    contributions: number[]
  ): Promise<SensitivityOutput> {
    const values: SensitivityOutput['values'] = [];
    
    for (const contribution of contributions) {
      const modifiedScenario = {
        ...baseScenario,
        cashContribution: contribution
      };
      
      const result = await this.calculateScenario(input, modifiedScenario);
      
      values.push({
        value: contribution,
        npv: result.metrics.npv,
        irr: result.metrics.irr,
        margin: result.summary.marginPercentage,
        dscr: result.metrics.dscr.min
      });
    }
    
    return {
      variable: 'Contributo Cash (€)',
      values,
      breakEvenPoint: this.findBreakEven(values, 'npv')
    };
  }
  
  private async sensitivityOnDeferredPayment(
    input: BusinessPlanInput,
    baseScenario: LandScenario,
    payments: number[]
  ): Promise<SensitivityOutput> {
    const values: SensitivityOutput['values'] = [];
    
    for (const payment of payments) {
      const modifiedScenario = {
        ...baseScenario,
        deferredPayment: payment
      };
      
      const result = await this.calculateScenario(input, modifiedScenario);
      
      values.push({
        value: payment,
        npv: result.metrics.npv,
        irr: result.metrics.irr,
        margin: result.summary.marginPercentage,
        dscr: result.metrics.dscr.min
      });
    }
    
    return {
      variable: 'Pagamento Differito (€)',
      values,
      breakEvenPoint: this.findBreakEven(values, 'npv')
    };
  }
  
  private findBreakEven(
    values: SensitivityOutput['values'],
    metric: 'npv' | 'margin'
  ): { value: number; description: string } | undefined {
    // Trova il punto dove la metrica attraversa zero
    for (let i = 0; i < values.length - 1; i++) {
      const current = values[i][metric];
      const next = values[i + 1][metric];
      
      if ((current < 0 && next >= 0) || (current >= 0 && next < 0)) {
        // Interpolazione lineare
        const fraction = Math.abs(current) / (Math.abs(current) + Math.abs(next));
        const breakEvenValue = values[i].value + (values[i + 1].value - values[i].value) * fraction;
        
        return {
          value: breakEvenValue,
          description: `${metric.toUpperCase()} = 0 a ${breakEvenValue.toFixed(2)}`
        };
      }
    }
    
    return undefined;
  }
  
  // ============================================================================
  // SCENARIO COMPARISON
  // ============================================================================
  
  /**
   * 📊 CONFRONTO SCENARI
   */
  async compareScenarios(outputs: BusinessPlanOutput[]): Promise<ScenarioComparison> {
    console.log('📊 [BusinessPlan] Confronto scenari...');
    
    // Ranking basato su score composito
    const ranking = outputs.map(output => {
      // Score = media pesata di VAN, TIR, Margine, DSCR
      const npvScore = output.metrics.npv / 100000; // Normalizza
      const irrScore = output.metrics.irr / 10; // Normalizza
      const marginScore = output.summary.marginPercentage / 10; // Normalizza
      const dscrScore = Math.min(output.metrics.dscr.min, 2) / 2; // Max 2, normalizza
      
      const score = (npvScore * 0.4) + (irrScore * 0.3) + (marginScore * 0.2) + (dscrScore * 0.1);
      
      return {
        scenarioId: output.scenarioId,
        rank: 0, // Verrà riempito dopo il sort
        score
      };
    }).sort((a, b) => b.score - a.score);
    
    // Assegna rank
    ranking.forEach((r, i) => r.rank = i + 1);
    
    // Raccomandazioni
    const recommendations: string[] = [];
    const best = outputs.find(o => o.scenarioId === ranking[0].scenarioId)!;
    
    recommendations.push(`Scenario migliore: ${best.scenarioName} con VAN €${this.formatNumber(best.metrics.npv)} e margine ${best.summary.marginPercentage.toFixed(1)}%`);
    
    if (best.metrics.dscr.min < 1.2) {
      recommendations.push('Attenzione: DSCR sotto 1.2 anche nello scenario migliore. Valuta aumento equity o ridimensionamento debito.');
    }
    
    // Calcola punti di equivalenza tra scenari
    const equivalencePoints = this.calculateEquivalencePoints(outputs);
    
    return {
      scenarios: outputs,
      ranking,
      recommendations,
      equivalencePoints
    };
  }
  
  private calculateEquivalencePoints(outputs: BusinessPlanOutput[]): ScenarioComparison['equivalencePoints'] {
    const points: ScenarioComparison['equivalencePoints'] = [];
    
    if (outputs.length < 2) return points;
    
    // Trova scenario migliore
    const best = outputs.reduce((prev, current) => 
      current.metrics.npv > prev.metrics.npv ? current : prev
    );
    
    // Per ogni altro scenario, calcola quanto serve per pareggiare
    for (const scenario of outputs) {
      if (scenario.scenarioId === best.scenarioId) continue;
      
      const deltaNPV = best.metrics.npv - scenario.metrics.npv;
      
      // Esempio: quanto contributo cash serve per pareggiare?
      if (scenario.scenarioName.includes('Permuta')) {
        points.push({
          fromScenario: scenario.scenarioId,
          toScenario: best.scenarioId,
          lever: 'Contributo Cash',
          requiredValue: deltaNPV * 1.1, // Approssimazione: serve ~10% in più per effetto tempo
          explanation: `${scenario.scenarioName} pareggia ${best.scenarioName} con contributo cash aggiuntivo di €${this.formatNumber(deltaNPV * 1.1)}`
        });
      }
      
      // Esempio: quanto sconto terreno serve?
      if (scenario.scenarioName.includes('Cash')) {
        points.push({
          fromScenario: scenario.scenarioId,
          toScenario: best.scenarioId,
          lever: 'Sconto Terreno',
          requiredValue: deltaNPV,
          explanation: `${scenario.scenarioName} pareggia ${best.scenarioName} con sconto terreno di €${this.formatNumber(deltaNPV)}`
        });
      }
    }
    
    return points;
  }
  
  // ============================================================================
  // PERSISTENCE (Firestore)
  // ============================================================================
  
  /**
   * 💾 SALVA BUSINESS PLAN
   */
  async saveBusinessPlan(
    input: BusinessPlanInput,
    outputs: BusinessPlanOutput[],
    userId: string
  ): Promise<string> {
    try {
      console.log('💾 [BusinessPlan] Salvataggio Business Plan...');
      
      const businessPlanData = {
        userId,
        projectId: input.projectId || `bp_${Date.now()}`,
        projectName: input.projectName,
        input: input,
        outputs: outputs,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { addDoc, collection } = await import('firebase/firestore');
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), businessPlanData);
      
      console.log('✅ [BusinessPlan] Business Plan salvato con ID:', docRef.id);
      
      // Invia notifica di Business Plan completato
      try {
        // Trova lo scenario migliore (quello con VAN più alto)
        const bestScenario = outputs.reduce((best, current) => 
          current.metrics.npv > best.metrics.npv ? current : best
        );
        
        await notificationTriggerService.notifyBusinessPlanCompleted(userId, {
          projectId: input.projectId || docRef.id,
          projectName: input.projectName,
          npv: bestScenario.metrics.npv,
          irr: bestScenario.metrics.irr,
          bestScenario: bestScenario.scenarioName
        });
        console.log('✅ [BusinessPlan] Notifica Business Plan completato inviata');
      } catch (notificationError) {
        console.error('❌ [BusinessPlan] Errore invio notifica:', notificationError);
        // Non bloccare il salvataggio se la notifica fallisce
      }
      
      // IMPORTANTE: Ritorna l'ID generato da Firestore
      return docRef.id;
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore salvataggio:', error);
      // Ritorna ID temporaneo se Firestore fallisce (per non bloccare il flow)
      return `bp_temp_${Date.now()}`;
    }
  }
  
  /**
   * 📖 CARICA BUSINESS PLAN
   */
  async loadBusinessPlan(businessPlanId: string): Promise<{
    input: BusinessPlanInput;
    outputs: BusinessPlanOutput[];
  }> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, businessPlanId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Business Plan non trovato');
      }
      
      const data = docSnap.data();
      return {
        input: data.input,
        outputs: data.outputs
      };
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore caricamento:', error);
      throw error;
    }
  }
  
  /**
   * 📋 LISTA BUSINESS PLAN PER PROGETTO
   */
  async getBusinessPlansByProject(projectId: string): Promise<any[]> {
    try {
      const q = query(
        safeCollection(this.COLLECTION_NAME),
        where('projectId', '==', projectId)
      );
      
      const snapshot = await getDocs(q);
      const businessPlans: any[] = [];
      
      snapshot.forEach((doc) => {
        businessPlans.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return businessPlans;
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore lista:', error);
      return [];
    }
  }
  
  /**
   * 📋 LISTA TUTTI I BUSINESS PLAN DI UN UTENTE
   */
  async getAllBusinessPlans(userId: string): Promise<any[]> {
    try {
      console.log('📋 [BusinessPlan] Caricamento lista BP per utente:', userId);
      
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
      
      const businessPlansRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        businessPlansRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const businessPlans: any[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        businessPlans.push({
          id: doc.id,
          projectName: data.projectName,
          location: data.input?.location || '',
          totalUnits: data.input?.totalUnits || 0,
          averagePrice: data.input?.averagePrice || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
          // Metriche del miglior scenario
          bestNPV: data.outputs?.length > 0 ? 
            Math.max(...data.outputs.map((o: any) => o.metrics?.npv || 0)) : 0,
          bestIRR: data.outputs?.length > 0 ? 
            Math.max(...data.outputs.map((o: any) => o.metrics?.irr || 0)) : 0,
          bestMargin: data.outputs?.length > 0 ? 
            Math.max(...data.outputs.map((o: any) => o.summary?.marginPercentage || 0)) : 0,
          scenariosCount: data.outputs?.length || 0
        });
      });
      
      console.log(`✅ [BusinessPlan] Trovati ${businessPlans.length} Business Plan`);
      return businessPlans;
      
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore caricamento lista:', error);
      throw error;
    }
  }

  /**
   * 🗑️ ELIMINA BUSINESS PLAN
   */
  async deleteBusinessPlan(businessPlanId: string, userId: string): Promise<boolean> {
    try {
      console.log('🗑️ [BusinessPlan] Eliminazione Business Plan:', businessPlanId);
      
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { getDoc, deleteDoc, doc, collection } = await import('firebase/firestore');
      
      // Verifica che il Business Plan appartenga all'utente
      const businessPlanDoc = await getDoc(doc(collection(db, this.COLLECTION_NAME), businessPlanId));
      
      if (!businessPlanDoc.exists()) {
        throw new Error('Business Plan non trovato');
      }
      
      const businessPlanData = businessPlanDoc.data();
      if (businessPlanData.userId !== userId) {
        throw new Error('Non autorizzato a eliminare questo Business Plan');
      }
      
      // Elimina il documento
      await deleteDoc(doc(collection(db, this.COLLECTION_NAME), businessPlanId));
      
      console.log('✅ [BusinessPlan] Business Plan eliminato con successo');
      return true;
      
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore eliminazione:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const businessPlanService = new BusinessPlanService();

