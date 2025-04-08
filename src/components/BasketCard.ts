import { ensureElement } from '../utils/utils';
import { Card, ICardActions } from './Card';

export interface IBasketCard {
    index: string;
}

export class BasketCard extends Card<IBasketCard> {
    protected _index: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container, actions);
        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
    }

    set index(value: string) {
        this.setText(this._index, value);
    }
}