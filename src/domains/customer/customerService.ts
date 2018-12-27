import { injectable, inject } from 'inversify';
import { Customer, RegisterSaleStatus, RegisterPayment, PaymentType, PosStore } from 'pos-models';
import { IStore } from '../../interfaces/store';
import SERVICE_IDENTIFIER from '../../constants/identifiers';

export interface ICustomerService {
  getCustomers(tenantId: string): Promise<Array<Customer>>;

  getCustomer(tenantId: string, id: string): Promise<Customer>;

  createCustomer(tenantId: string, customer: Customer): Promise<Customer>;

  updateCustomer(tenantId: string, customer: Customer): Promise<Customer>;
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

  calculateCustomerValues(customer: Customer, saleStatus: RegisterSaleStatus, payments: RegisterPayment[], store: PosStore) {
    const totalCashPaid = this.getTotalAmountByPaymentType(PaymentType.Cash, payments);
    const totalCreditCardPaid = this.getTotalAmountByPaymentType(PaymentType.CreditCard, payments);
    const totalPaidStorePoints = this.getTotalAmountByPaymentType(PaymentType.StorePoint, payments);

    customer.totalSalesAmount += totalCashPaid + totalCreditCardPaid;

    if (saleStatus === RegisterSaleStatus.Completed) {
      customer.totalSalesCount++;
      customer.lastPurchasedDate = new Date();
    } else if (saleStatus === RegisterSaleStatus.ReturnCompleted) {
      customer.totalReturnsCount++;
    }

    // reward points calculation
    const { useReward, rewardRateForCash = 0, rewardRateForCredit = 0 } = store;
    if (useReward) {
      const earnedPointsFromCashPayment = Math.round(totalCashPaid * rewardRateForCash / 100);
      const earnedPointsFromCreditPayment = Math.round(totalCreditCardPaid * rewardRateForCredit / 100);
      const totalPointsEarned = earnedPointsFromCashPayment + earnedPointsFromCreditPayment;
      customer.currentStorePoint += totalPointsEarned;
      customer.totalStorePoint += totalPointsEarned;
    }

    if (totalPaidStorePoints > 0) {
      customer.currentStorePoint -= totalPaidStorePoints;
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
