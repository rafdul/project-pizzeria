import {classNames, templates, settings, select} from '../settings.js';
import CartProduct from './CartProduct.js';
import {utils} from '../utils.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    // console.log(thisCart.products);
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    // console.log(thisCart.dom.wrapper);
    // console.log(thisCart.dom.toggleTrigger);
  }

  // metoda służąca pokazywaniu i ukrywaniu koszyka;
  // wychwytywaniu eventów o aktualizacji zawartości koszyka (po dodaniu produktu, usunięciu)
  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      // console.log(event);
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();

      thisCart.cleanCart();

    });
  }

  // metoda usuwająca produkt z koszyka
  remove(cartProduct){
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }

  // wysyłanie produktu do koszyka
  add(menuProduct){
    const thisCart = this;

    // Make html code by templates and save to const
    const generatedHTML = templates.cartProduct(menuProduct);

    // Change html code in DOM elements and save to const
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    // Add DOM elements to thisCart.dom.productList
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products', thisCart.products);

    // console.log('adding product', menuProduct); // menuProduct=thisProduct z metody addToCart w produkcie

    thisCart.update();
  }

  // sumowanie koszyka
  update(){
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    console.log('total number', thisCart.totalNumber);
    console.log('subtotal price', thisCart.subtotalPrice);
    console.log('total price', thisCart.totalPrice);

    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  // wysyłanie danych zamówienia do API
  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      phone: thisCart.dom.phone.value,
      address: thisCart.dom.address.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: settings.cart.defaultDeliveryFee,
      totalPrice: thisCart.totalPrice,
      products: [],
    };

    // pętla iterująca po wszystkich thisCart.products,
    // i dla każdego produktu wywołująca jego metodę getData (napisana w CartProduct)
    for(let product of thisCart.products){
      // product.getData();
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
    // console.log('payload.products', payload.products);

  }

  // resetowanie koszyka po wysłaniu zamówienia
  cleanCart(){
    const thisCart = this;
    console.log(thisCart);

    // zerowanie ilości i cen
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }

    // console.log(thisCart.products);

    // zerowanie produktów (najpierw czyszczę elementy dom, potem tablicę z produktami w koszyku)
    for(let product of thisCart.products){
      product = thisCart.dom.wrapper.querySelector('.cart__order-summary li');
      product.remove();
      console.log(product);
    }
    thisCart.products.splice(0);

    // thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    // thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    // thisCart.dom.phone.innerHTML = '';
    // thisCart.dom.address.innerHTML = '';

    // zerowanie adresów
    thisCart.dom.phone.value = '';
    thisCart.dom.address.value = '';

    // thisCart.update();
  }
}

export default Cart;


