
import { Entity } from './entity';
import { Subscription } from '../interfaces/subscription';

export enum RetailerType { Fashion_Apparel, Home_LifeStyle, Sports_Toys, Health_Beauty, Food_Drink, Cafe_Restaurants, Salons, Other = 99 }

export class Customer extends Entity {
    tenantId: string;
    retailerType: RetailerType;
    numberOfStores: number;
    storeName: string;
    webAddress: string;
    name: string;
    email: string;
    phone: string;
    subscription: Subscription;

    constructor(tenantId: string,
        retailerType: RetailerType,
        numberOfStores: number,
        storeName: string,
        webAddress: string,
        name: string,
        email: string,
        phone: string) {
        super();
        this._id = 'customer_' + tenantId;
        this.tenantId = tenantId;
        this.retailerType = retailerType;
        this.numberOfStores = numberOfStores;
        this.storeName = storeName;
        this.webAddress = webAddress;
        this.name = name;
        this.email = email;
        this.phone = phone;
    }
}
