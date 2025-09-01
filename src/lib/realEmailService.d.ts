export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  lands: any[];
  summary: {
    totalFound: number;
    averagePrice: number;
    bestOpportunities: any[];
    marketTrends?: string;
    recommendations?: string[];
  };
  analysis?: any[];
  marketTrends?: string;
  aiRecommendations?: string[];
}
export declare class RealEmailService {
  private resend;
  private isConfigured;
  constructor();
  sendEmail(notification: EmailNotification): Promise<void>;
  private saveEmailLog;
  testEmailSend(): Promise<boolean>;
  verifyEmailConfig(): Promise<boolean>;
  get isEmailConfigured(): boolean;
}
export declare const realEmailService: RealEmailService;
//# sourceMappingURL=realEmailService.d.ts.map
