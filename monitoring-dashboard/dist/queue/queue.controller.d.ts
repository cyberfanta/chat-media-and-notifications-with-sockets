import { DashboardService } from '../dashboard/dashboard.service';
export declare class QueueController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getQueueStatus(): Promise<{
        queue: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            jobs: ({
                id: string;
                filename: string;
                mediaType: string;
                status: string;
                progress: {
                    percentage: number;
                    stage: string;
                };
                createdAt: string;
            } | {
                id: string;
                filename: string;
                mediaType: string;
                status: string;
                createdAt: string;
                progress?: undefined;
            })[];
        };
    }>;
}
