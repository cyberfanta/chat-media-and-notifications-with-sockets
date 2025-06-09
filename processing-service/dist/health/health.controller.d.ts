export declare class HealthController {
    check(): {
        success: boolean;
        message: string;
        timestamp: string;
        service: string;
        version: string;
    };
}
