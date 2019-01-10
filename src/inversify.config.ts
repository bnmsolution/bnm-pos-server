import 'reflect-metadata';
import { Container } from 'inversify';

import SERVICE_IDENTIFIER from './constants/identifiers';
import { IStore } from './interfaces/store';
import { CouchDb } from './store/couch';
import { RegistrableController } from './interfaces/registerableController';
import { ICategoryService, CategoryService } from './domains/category/categoryService';
import { CategoryController } from './domains/category/categoryController';
import { TenantController } from "./domains/tenant/tenantController";
import { Auth, IAuthService } from "./auth/auth";
import { IRegisterService, RegisterService } from "./domains/register/registerService";
import { ITaxService, TaxService } from "./domains/tax/taxService";
import { IEmployeeService, EmployeeService } from "./domains/employee/employeeService";
import { ProductController } from "./domains/product/productController";
import { IProductService, ProductService } from "./domains/product/productService";
import { RegisterController } from "./domains/register/registerController";
import { RegisterSaleController } from "./domains/registerSale/registerSaleController";
import { IRegisterSaleService, RegisterSaleService } from "./domains/registerSale/registerSaleService";
import { CustomerController } from "./domains/customer/customerContorller";
import { CustomerService, ICustomerService } from "./domains/customer/customerService";
import { IInventoryService, InventoryService } from "./domains/inventory/inventoryService";
import { InventoryController } from "./domains/inventory/inventoryController";
import { EventPublisher } from "./shared/eventPublisher";
import { EventHandler } from "./shared/eventHandler";
import {
  RegisterSaleClosedEvent,
  RegisterSaleClosedEventHandler
} from "./domains/registerSale/registerSaleClosedEventHandler";
import { StoreService, IStoreService } from "./domains/store/storeService";
import { StoreController } from "./domains/store/storeController";
import { VendorController } from "./domains/vendor/vendorController";
import { VendorService } from "./domains/vendor/vendorService";
import { IVendorService } from "./domains/vendor/vendorService";
import { EmployeeController } from "./domains/employee/employeeController";
import { ProductCreatedEventHandler } from './domains/product/productCreatedEventHandler';
import { ImportController } from './domains/import/importController';
import { IImportService, ImportService } from './domains/import/importService';
import { PointRequestedEventHandler } from './domains/customer/pointRequestedEventHandler';
import { ApplyRewardPointEventHandler } from './domains/customer/applyRewardPointEventHandler';

const container = new Container();

/** CONTROLLERS */
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(CategoryController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(TenantController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(ProductController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(RegisterController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(RegisterSaleController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(CustomerController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(InventoryController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(StoreController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(VendorController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(EmployeeController);
container.bind<RegistrableController>(SERVICE_IDENTIFIER.Controller).to(ImportController);

/** SERVICES */
container.bind<ICategoryService>(SERVICE_IDENTIFIER.CategoryService).to(CategoryService);
container.bind<IRegisterService>(SERVICE_IDENTIFIER.RegisterService).to(RegisterService);
container.bind<IRegisterSaleService>(SERVICE_IDENTIFIER.RegisterSaleService).to(RegisterSaleService);
container.bind<ITaxService>(SERVICE_IDENTIFIER.TaxService).to(TaxService);
container.bind<IEmployeeService>(SERVICE_IDENTIFIER.EmployeeService).to(EmployeeService);
container.bind<IProductService>(SERVICE_IDENTIFIER.ProductService).to(ProductService);
container.bind<IAuthService>(SERVICE_IDENTIFIER.AuthService).to(Auth);
container.bind<ICustomerService>(SERVICE_IDENTIFIER.CustomerService).to(CustomerService);
container.bind<IInventoryService>(SERVICE_IDENTIFIER.InventoryService).to(InventoryService);
container.bind<IStoreService>(SERVICE_IDENTIFIER.StoreService).to(StoreService);
container.bind<IVendorService>(SERVICE_IDENTIFIER.VendorService).to(VendorService);
container.bind<IImportService>(SERVICE_IDENTIFIER.ImportService).to(ImportService);

/** STORES **/
container.bind<IStore>(SERVICE_IDENTIFIER.Store).to(CouchDb).inSingletonScope();


container.bind<EventHandler>(SERVICE_IDENTIFIER.EventHandler).to(RegisterSaleClosedEventHandler);
container.bind<EventHandler>(SERVICE_IDENTIFIER.EventHandler).to(ProductCreatedEventHandler);
container.bind<EventHandler>(SERVICE_IDENTIFIER.EventHandler).to(PointRequestedEventHandler);
container.bind<EventHandler>(SERVICE_IDENTIFIER.EventHandler).to(ApplyRewardPointEventHandler);

const eventHandlers: EventHandler[] = container.getAll<EventHandler>(SERVICE_IDENTIFIER.EventHandler);
container.bind<EventPublisher>(SERVICE_IDENTIFIER.EventPublisher).toDynamicValue(() => new EventPublisher(eventHandlers)).inSingletonScope();

export default container;
