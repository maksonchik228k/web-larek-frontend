import { EventEmitter } from './components/base/events';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { Card } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order } from './components/Order';
import { Success } from './components/common/Success';
import { WebLarekAPI } from './components/WebLarekAPI';
import { Page } from './components/Page';
import { AppData } from './components/AppData';
import {
    Events,
    IPaymentAndAddressForm,
    IPaymentPhoneAndEmailForm,
    IProduct,
    PaymentMethod,
} from './types';
import { Contacts } from './components/Contacts';
import { BasketCard } from './components/BasketCard';

const Templates = {
    CATALOG: ensureElement<HTMLTemplateElement>('#card-catalog'),
    PREVIEW: ensureElement<HTMLTemplateElement>('#card-preview'),
    CONTACTS: ensureElement<HTMLTemplateElement>('#contacts'),
    SUCCESS: ensureElement<HTMLTemplateElement>('#success'),
    CARDBASKET: ensureElement<HTMLTemplateElement>('#card-basket'),
    ORDER: ensureElement<HTMLTemplateElement>('#order'),
    BASKET: ensureElement<HTMLTemplateElement>('#basket'),
};

const api = new WebLarekAPI(CDN_URL, API_URL);
const events = new EventEmitter();
const appData = new AppData({}, events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(Templates.BASKET), events);
const order = new Order(cloneTemplate(Templates.ORDER), events);
const contacts = new Contacts(cloneTemplate(Templates.CONTACTS), events);

// Загрузка товаров
api.getProducts()
    .then(appData.setProducts.bind(appData))
    .catch(console.error);

// Обработчики событий каталога
events.on(Events.CATALOG_CHANGED, () => {
    page.catalog = appData.products.map((product) =>
        new Card(cloneTemplate(Templates.CATALOG), {
            onClick: () => events.emit(Events.CATALOG_SHOW, product)
        }).render(product)
    );
});

events.on(Events.CATALOG_SHOW, (product: IProduct) => {
    const card = new Card(cloneTemplate(Templates.PREVIEW), {
        onClick: () => {
            if (appData.basket.includes(product.id)) {
                events.emit(Events.BASKET_OPEN);
            } else {
                events.emit(Events.CARD_ADD, product);
            }
        }
    });

    card.button = !appData.basket.includes(product.id);
    modal.render({ content: card.render(product) });
});

// Обработчики корзины
events.on(Events.CARD_ADD, (product: IProduct) => {
    appData.addToBasket(product);
});

events.on(Events.CARD_DELETE, (product: IProduct) => {
    appData.removeFromBasket(product.id);
});

events.on(Events.BASKET_CHANGED, () => {
    page.counter = appData.getCountOfItems();
    basket.items = appData.getAddedProducts().map((product, index) => {
        const card = new BasketCard(cloneTemplate(Templates.CARDBASKET), {
            onClick: () => events.emit(Events.CARD_DELETE, product)
        });
        
        // Сначала рендерим карточку с базовыми свойствами
        const renderedCard = card.render({ 
            title: product.title,
            price: product.price,
            index: (index + 1).toString()
        });
        
        // Затем устанавливаем специфичные для BasketCard свойства
        card.index = (index + 1).toString();
        
        return renderedCard;
    });
    basket.total = appData.getTotal();
});

events.on(Events.BASKET_OPEN, () => {
    modal.render({ content: basket.render() });
});

// Обработчики заказа
events.on(Events.ORDER_INIT, () => {
    modal.render({
        content: order.render({
            valid: false,
            errors: [],
            address: '',
            payment: PaymentMethod.ONLINE
        })
    });
});

events.on(Events.ORDER_PAYMENT_CHANGE, (data: { payment: PaymentMethod }) => {
    appData.setOrderField('payment', data.payment);
    appData.validateOrder();
});

events.on(Events.ORDER_ADDRESS_CHANGE, (data: { address: string }) => {
    appData.setOrderField('address', data.address);
    appData.validateOrder();
});

events.on(Events.ORDER_VALIDATED, (data: { valid: boolean }) => {
    order.valid = data.valid;
});

events.on(Events.ORDER_SUBMIT, (data: IPaymentAndAddressForm) => {
    appData.setOrderField('address', data.address);
    appData.setOrderField('payment', data.payment);
    events.emit(Events.CONTACTS_OPEN);
});

events.on(Events.CONTACTS_OPEN, () => {
    modal.render({
        content: contacts.render({
            valid: false,
            errors: [],
            email: '',
            phone: ''
        })
    });
});

// Обработчики контактов
events.on(Events.CONTACTS_UPDATE, (data: IPaymentPhoneAndEmailForm) => {
    appData.validateContacts(data);
});

events.on(Events.CONTACTS_VALIDATED, (data: { valid: boolean, errors: string[] }) => {
    contacts.valid = data.valid;
    contacts.errors = data.errors.join(', ');
});

events.on(Events.CONTACTS_SUBMIT, () => {
    appData.order.total = appData.getTotal();
    api.order(appData.order)
        .then(() => {
            const success = new Success(cloneTemplate(Templates.SUCCESS), {
                onClick: () => {
                    modal.close();
                    appData.clearBasket();
                }
            });
            modal.render({
                content: success.render({ total: appData.order.total })
            });
        })
        .catch(console.error);
});

// Обработчики модального окна
events.on(Events.MODAL_OPEN, () => {
    page.locked = true;
});

events.on(Events.MODAL_CLOSE, () => {
    page.locked = false;
});