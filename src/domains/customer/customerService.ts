import { injectable, inject } from 'inversify';
import { Customer, RegisterSaleStatus, RegisterPayment, PaymentType, PosStore, PointRequest, PointRequestAccepted, RegisterdBy, PointUsageTrasaction, RegisterSale } from 'pos-models';
const uuid = require('uuid/v1');

import { IStore } from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

export interface ICustomerService {
  getCustomers(tenantId: string): Promise<Array<Customer>>;

  getCustomer(tenantId: string, id: string): Promise<Customer>;

  createCustomer(tenantId: string, customer: Customer): Promise<Customer>;

  updateCustomer(tenantId: string, customer: Customer): Promise<Customer>;

  findCustomerByPhoneNumber(tenantId: string, phoneNumber: string): Promise<Customer>;

  applyRewardPoints(tenantId: string, { saleId, customerPhoneNumber, enablePoints }: PointRequest): Promise<PointRequestAccepted>;
}

@injectable()
export class CustomerService implements ICustomerService {

  @inject(SERVICE_IDENTIFIER.Store)
  private _store: IStore;

  getCustomers(tenantId: string): Promise<Customer[]> {
    throw new Error("Method not implemented.");
  }

  async getCustomer(tenantId: string, id: string): Promise<Customer> {
    return await this._store.get(tenantId, `customer_${id}`);
  }

  async createCustomer(tenantId: string, customer: Customer): Promise<Customer> {
    // check max-customer invariant
    return await this._store.insert(tenantId, customer, 'customer');
  }

  async updateCustomer(tenantId: string, customer: Customer): Promise<Customer> {
    return await this._store.update(tenantId, customer);
  }

  async findCustomerByPhoneNumber(tenantId: string, phoneNumber: string): Promise<Customer> {
    const customers = await this._store.find(tenantId, {
      selector: {
        phone: {
          $eq: phoneNumber
        }
      }
    });
    return customers.length ? customers[0] : null;
  }

  /**
   * Applies customer reward points. Must be initiated by bnm-point app.
   * @param param0 PointRequest
   */
  async applyRewardPoints(tenantId, { saleId, customerPhoneNumber, enablePoints }: PointRequest): Promise<PointRequestAccepted> {
    const customer = await this.findCustomerByPhoneNumber(tenantId, customerPhoneNumber);

    if (customer === null) {
      // todo: extract customer creation logic
      const newCustomer: any = {
        id: uuid(),
        name: '',
        phone: customerPhoneNumber,
        dateOfJoin: new Date(),
        totalStorePoint: 0,
        currentStorePoint: 0,
        totalSalesCount: 0,
        totalSalesAmount: 0,
        totalReturnsCount: 0,
        registerdBy: RegisterdBy.PointApp,
        pointUsageTransactions: []
      };
      this.createCustomer(tenantId, newCustomer);
      return new PointRequestAccepted('', customerPhoneNumber, newCustomer.id, enablePoints, enablePoints, true);
    } else {
      return new PointRequestAccepted(customer.name, customer.phone, customer.id, enablePoints, customer.currentStorePoint + enablePoints, false);
    }
  }

  calculateCustomerValues(customer: Customer, sale: RegisterSale, store: PosStore) {
    const { payments, status, salesDate} = sale;
    const totalCashPaid = this.getTotalAmountByPaymentType(PaymentType.Cash, payments);
    const totalCreditCardPaid = this.getTotalAmountByPaymentType(PaymentType.CreditCard, payments);
    const totalPaidStorePoints = this.getTotalAmountByPaymentType(PaymentType.StorePoint, payments);

    customer.totalSalesAmount += totalCashPaid + totalCreditCardPaid;

    if (status === RegisterSaleStatus.Completed) {
      customer.totalSalesCount++;
      customer.lastPurchasedDate = salesDate;
    } else if (status === RegisterSaleStatus.ReturnCompleted) {
      customer.totalReturnsCount++;
    }

    // reward points calculation
    if (store.useReward) {
      const totalPointsEarned = this.calculateEarnableRewordPoints(payments, store);
      customer.currentStorePoint += totalPointsEarned;
      customer.totalStorePoint += totalPointsEarned;
    }

    if (totalPaidStorePoints > 0) {
      const transcation: PointUsageTrasaction = {
        saleId: sale.id,
        amount: totalPaidStorePoints,
        date: salesDate
      }
      customer.currentStorePoint -= totalPaidStorePoints;

      if (customer.pointUsageTransactions === undefined) {
        customer.pointUsageTransactions = [];
      }
      customer.pointUsageTransactions.push(transcation)
    }
  }

  calculateEarnableRewordPoints(payments: RegisterPayment[], store: PosStore) {
    const totalCashPaid = this.getTotalAmountByPaymentType(PaymentType.Cash, payments);
    const totalCreditCardPaid = this.getTotalAmountByPaymentType(PaymentType.CreditCard, payments);

    const { rewardRateForCash = 0, rewardRateForCredit = 0 } = store;
    const earnedPointsFromCashPayment = Math.round(totalCashPaid * rewardRateForCash / 100);
    const earnedPointsFromCreditPayment = Math.round(totalCreditCardPaid * rewardRateForCredit / 100);
    const totalPointsEarned = earnedPointsFromCashPayment + earnedPointsFromCreditPayment;

    return totalPointsEarned;
  }

  getTotalAmountByPaymentType(paymentType: PaymentType, payments: RegisterPayment[]): number {
    return payments
      .filter(p => p.paymentType === paymentType)
      .map(p => p.amount)
      .reduce((acc, cur) => acc + cur, 0);
  }

}
