import { Events, IFormState, IPaymentAndAddressForm, PaymentMethod } from '../types';
import { ensureAllElements, ensureElement } from '../utils/utils';
import { IEvents } from './base/events';
import { Form } from './common/Form';

export class Order extends Form<IPaymentAndAddressForm> {
    protected _paymentButtons: HTMLButtonElement[];
    protected _submitButton: HTMLButtonElement;
    protected _addressInput: HTMLInputElement;
    private _selectedPayment: PaymentMethod | null = null;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
        this._submitButton = ensureElement<HTMLButtonElement>('.order__button', container);
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);

        // Инициализация состояния кнопки
        this.setDisabled(this._submitButton, true);

        // Обработка выбора способа оплаты
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this._selectedPayment = button.name === 'card' ? PaymentMethod.ONLINE : PaymentMethod.CARD;
                this._paymentButtons.forEach(btn => {
                    btn.classList.toggle('button_alt-active', btn === button);
                });
                this.validateForm();
            });
        });

        // Обработка ввода адреса
        this._addressInput.addEventListener('input', () => {
            this.validateForm();
        });

        // Обработка отправки формы
        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.isFormValid()) {
                this.events.emit(Events.ORDER_SUBMIT, {
                    payment: this._selectedPayment,
                    address: this._addressInput.value
                });
            }
        });
    }

    private isFormValid(): boolean {
        return !!this._selectedPayment && this._addressInput.value.trim() !== '';
    }

    private validateForm(): void {
        const isValid = this.isFormValid();
        this.setDisabled(this._submitButton, !isValid);
    }

    set address(value: string) {
        this._addressInput.value = value;
        this.validateForm();
    }

    set payment(value: PaymentMethod) {
        const buttonName = value === PaymentMethod.ONLINE ? 'card' : 'cash';
        const button = this._paymentButtons.find(b => b.name === buttonName);
        if (button) button.click();
    }

    set valid(value: boolean) {
        this.setDisabled(this._submitButton, !value);
    }
}