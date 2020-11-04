import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    // console.log('new cartProduct:', thisCartProduct);
    // console.log('menu product', menuProduct);
  }

  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  // Obsługa widgetu ilości sztuk w koszyku
  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    // console.log(thisCartProduct.amountWidget);

    // nasłuchiwanie eventu ('updated') stworzonego w metodzie announce
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      // console.log(thisCartProduct.amount);
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  // metoda wysyłająca event do koszyka 'usuń produkt'
  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    // console.log(event);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault;
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault;

      thisCartProduct.remove();
      // console.log('start remove in cart',event);
    });
  }

  getData(){
    const thisCartProduct = this;

    const dataProduct = {
      id: thisCartProduct.id,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      amount: thisCartProduct.amount,
      params: thisCartProduct.params,
    };
    // console.log('dataProduct', dataProduct);
    return dataProduct;
  }
}

export default CartProduct;
