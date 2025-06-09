import { DashboardService } from '../dashboard/dashboard.service';
export declare class StatsController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSystemStats(): Promise<{
        stats: {
            totalJobs: number;
            activeJobs: number;
            totalNotifications: number;
            successRate: number;
            processingTimeAvg: number;
            queueSize: number;
        };
    }>;
}
