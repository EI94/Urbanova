// FeasibilityTool - Urbanova AI
export class FeasibilityTool {
  async run_bp(args: any): Promise<any> {
    return { roi: 0.25, marginPct: 0.15, paybackYears: 5 };
  }

  async run_sensitivity(args: any): Promise<any> {
    return { scenarios: [{ deltaLabel: 'Base', roi: 0.25 }] };
  }
}
