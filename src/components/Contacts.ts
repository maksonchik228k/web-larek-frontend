import { Events, IPaymentPhoneAndEmailForm } from '../types';
import { IEvents } from './base/events';
import { Form } from './common/Form';

export class Contacts extends Form<IPaymentPhoneAndEmailForm> {
    protected _button: HTMLButtonElement;
    protected _email: HTMLInputElement;
    protected _phone: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._button = this.container.querySelector('button[type=submit]');
        this._email = this.container.querySelector('input[name="email"]');
        this._phone = this.container.querySelector('input[name="phone"]');

        // Отправка данных формы при валидации
        [this._email, this._phone].forEach((input) => {
            input.addEventListener('input', () => {
                this.events.emit(Events.CONTACTS_UPDATE, {
                    email: this._email.value,
                    phone: this._phone.value
                });
            });
        });

        container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(Events.CONTACTS_SUBMIT, {
                email: this._email.value,
                phone: this._phone.value
            });
        });
    }

    // Установка состояния формы из модели
    set valid(value: boolean) {
        this._button.disabled = !value;
    }

    set errors(value: string) {
        super.errors = value;
    }

    // Обновление полей формы
    set email(value: string) {
        this._email.value = value;
    }

    set phone(value: string) {
        this._phone.value = value;
    }
}