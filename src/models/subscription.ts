import { Subscription, SubscriptionType } from '../interfaces/subscription';

export class FreeSubscription implements Subscription {
    tenantId: string;
    type: SubscriptionType = SubscriptionType.Free;
    name: 'Free';
    description: string;
    maxStores = 1;
    maxRegisters = 1;
    maxUsers = 1;
    maxProducts = 10;
    maxCustomers = 1000;
}