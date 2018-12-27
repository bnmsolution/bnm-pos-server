export enum SubscriptionType { Free, Basic, Advenced, MultiStore}
export interface Subscription {
    tenantId: string;
    type: SubscriptionType;
    name: string;
    description: string;
    maxStores: number;
    maxRegisters: number;
    maxUsers: number;
    maxProducts: number;
    maxCustomers: number;
}