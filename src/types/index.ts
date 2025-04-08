export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export interface IBasket {
	items: IProduct[];
	totalPrice: number;
	addItem(item: IProduct): void;
	removeItem(itemId: IProduct): void;
	calculateTotalPrice(): number;
}

export enum PaymentMethod {
	ONLINE = 'Онлайн',
	CARD = 'При получении',
}

export interface IOrder {
	phone: string;
	email: string;
	address: string;
	payment: PaymentMethod;
	items: string[];
	total: number;
}

export interface IFormState {
	valid: boolean;
	errors: string[];
}

export interface IPaymentAndAddressForm {
	address: string;
	payment: PaymentMethod;
}

export interface IPaymentPhoneAndEmailForm {
	phone: string;
	email: string;
}

export interface IWebLarekAPI {
	getProducts(): Promise<IProduct[]>;
	getProductById(id: number): Promise<IProduct>;
	order(order: IOrder): Promise<IOrderResponse>;
}

export interface IAppState {
	products: IProduct[];
	basket: string[];
	order: IOrder | null;
}

export interface IOrderResponse {
	status: string;
	totalPrice: number;
}

export enum Events {
	CATALOG_CHANGED = 'catalog:changed',
	CATALOG_SHOW = 'catalog:show',
	CARD_ADD = 'card:add',
	CARD_DELETE = 'card:delete',
	BASKET_OPEN = 'basket:open',
	ORDER_OPEN = 'order:open',
	ORDER_SUBMIT = 'order:submit',
	CONTACTS_OPEN = 'contacts:open',
	MODAL_OPEN = 'modal:open',
	MODAL_CLOSE = 'modal:close',
	CONTACTS_UPDATE = 'contacts:update',
    CONTACTS_SUBMIT = 'contacts:submit',
	BASKET_CHANGED = 'basket:changed',
    CONTACTS_VALIDATED = 'contacts:validated',
    ORDER_VALIDATED = 'order:validated',
	ORDER_INIT = 'order:init',
	ORDER_PAYMENT_CHANGE = 'order:payment:change',
    ORDER_ADDRESS_CHANGE = 'order:address:change',
}

