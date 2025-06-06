import { OnModuleDestroy } from '@nestjs/common';
export declare class RedisService implements OnModuleDestroy {
    private readonly logger;
    private client;
    constructor();
    private connect;
    publish(channel: string, message: string): Promise<void>;
    publishNotificationEvent(event: string, data: any): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
