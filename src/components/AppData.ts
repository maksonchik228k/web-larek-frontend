import { Events, IAppState, IOrder, IProduct, PaymentMethod } from '../types';
import { Model } from './base/Model';

export class AppData extends Model<IAppState> {
    private _basket: string[] = [];
    private _catalog: IProduct[];
    private _order: IOrder = {
        phone: '',
        address: '',
        email: '',
        payment: PaymentMethod.ONLINE,
        items: [],
        total: 0,
    };

    // Геттеры/сеттеры
    get basket(): string[] {
        return this._basket;
    }

    get products(): IProduct[] {
        return this._catalog;
    }

    get order(): IOrder {
        return this._order;
    }

    // Методы для работы с корзиной
    addToBasket(product: IProduct): void {
        if (!this._basket.includes(product.id)) {
            this._basket.push(product.id);
            this._order.items.push(product.id);
            this.updateBasket();
        }
    }

    removeFromBasket(productId: string): void {
        this._basket = this._basket.filter(id => id !== productId);
        this._order.items = this._order.items.filter(id => id !== productId);
        this.updateBasket();
    }

    private updateBasket(): void {
        this.emitChanges(Events.BASKET_CHANGED, {
            items: this.getAddedProducts(),
            total: this.getTotal(),
            count: this.getCountOfItems()
        });
    }

    // Методы для работы с заказом
    setOrderField(field: keyof IOrder, value: string | PaymentMethod): void {
        this._order[field] = value as never;
        this.validateOrder();
    }

    // Валидация контактных данных
    validateContacts(data: { email: string; phone: string }): void {
        const emailValid = this.validateEmail(data.email);
        const phoneValid = this.validatePhone(data.phone);
        const isValid = emailValid && phoneValid;

        this.emitChanges(Events.CONTACTS_VALIDATED, {
            valid: isValid,
            errors: this.getValidationErrors(emailValid, phoneValid)
        });

        if (isValid) {
            this._order.email = data.email;
            this._order.phone = data.phone;
        }
    }

    private validateEmail(email: string): boolean {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    private validatePhone(phone: string): boolean {
        const re = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;
        return re.test(phone);
    }

    private getValidationErrors(emailValid: boolean, phoneValid: boolean): string[] {
        const errors: string[] = [];
        if (!emailValid) errors.push('Неверный формат email');
        if (!phoneValid) errors.push('Неверный формат телефона');
        return errors;
    }

    // Валидация всего заказа
    public validateOrder(): void {
        const isAddressValid = this._order.address.trim() !== '';
        const isPaymentValid = this._order.payment !== undefined;
        const isContactsValid = this.validateEmail(this._order.email) && 
                              this.validatePhone(this._order.phone);
        
        this.emitChanges(Events.ORDER_VALIDATED, {
            valid: isAddressValid && isPaymentValid && isContactsValid
        });
    }

    // Вспомогательные методы
    setProducts(products: IProduct[]): void {
        this._catalog = products;
        this.emitChanges(Events.CATALOG_CHANGED, { catalog: this._catalog });
    }

    getAddedProducts(): IProduct[] {
        return this._catalog.filter(item => this._basket.includes(item.id));
    }

    getTotal(): number {
        return this.getAddedProducts().reduce((sum, item) => sum + item.price, 0);
    }

    getCountOfItems(): number {
        return this._basket.length;
    }

    clearBasket(): void {
        this._basket = [];
        this._order.items = [];
        this.updateBasket();
    }
}