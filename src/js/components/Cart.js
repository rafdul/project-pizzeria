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
    // thisCart.checkForm();

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

    // thisCart.dom.inputTel = thisCart.dom.wrapper.querySelector('input[name=phone]');
    // thisCart.dom.inputEmail = thisCart.dom.wrapper.querySelector('input[name=address]');
    thisCart.dom.formMessage = thisCart.dom.wrapper.querySelector('.form-message');

    // console.log(thisCart.dom.inputTel);
    // console.log(thisCart.dom.phone);

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

    // listenery w formularzu przy polach z email i telefon
    thisCart.dom.phone.addEventListener('input', function(event){
      thisCart.markFieldError(event.target, !thisCart.testTel(event.target));
      // console.log(event.target);
    });
    thisCart.dom.address.addEventListener('input', function(event){
      thisCart.markFieldError(event.target, !thisCart.testEmail(event.target));
      // console.log(event.target);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();

      thisCart.validateAddresses();
      // thisCart.validateForm();

      // sendOrder przeniosłem do metody validateAddresses
      // thisCart.sendOrder();

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

    thisCart.cleanCart();

  }

  // resetowanie koszyka po wysłaniu zamówienia
  cleanCart(){
    const thisCart = this;
    console.log(thisCart);

    // zerowanie produktów (najpierw czyszczę elementy dom, potem tablicę z produktami w koszyku)
    thisCart.cleanAllProducts();

    // zerowanie adresów i komunikatów
    thisCart.cleanAddresses();

  }

  // zerowanie produktów w koszyku
  cleanAllProducts(){
    const thisCart = this;

    for(let product of thisCart.products){
      console.log(product);
      product.dom.wrapper.remove();
    }
    thisCart.products = [];

    // uruchomienie update przeliczy też ilości i ceny
    thisCart.update();
  }

  // zerowanie adresów i komunikatów
  cleanAddresses(){
    const thisCart = this;

    // zerowanie adresów
    thisCart.dom.phone.value = '';
    thisCart.dom.address.value = '';

    // zerowanie komunikatów o błędach
    thisCart.dom.wrapper.querySelector('.form-message').innerHTML = '';

  }

  // walidacja pola z numerem telefonu
  testTel(field){
    const regTel = /[0-9]{9}/;
    return regTel.test(field.value);
  }

  // walidacja pola z emailem
  testEmail(field){
    const regEmail = /[a-zA-Z_0-9-]{3,}@[a-zA-Z0-9-]{2,}[.]{1}[a-zA-Z]{2,}/;
    return regEmail.test(field.value);
  }

  // dodawanie nowej klasy w css przy błędach w formularzu
  markFieldError(field, show){
    if(show){
      field.classList.add('field-error');
    } else {
      field.classList.remove('field-error');
    }
  }

  // walidacja formularza
  validateAddresses(){
    const thisCart = this;

    let errors = [];
    console.log('errors1', errors);

    // jeśli nie ma błędów
    for(const el of [thisCart.dom.phone, thisCart.dom.address]){
      thisCart.markFieldError(el, false);
    }

    if(!thisCart.testTel(thisCart.dom.phone)){
      thisCart.markFieldError(thisCart.dom.phone, true);
      errors.push('Wypełnij poprawnie numer telefonu (od 9 do 14 znaków, tylko cyfry oraz +)');
      console.log(thisCart.dom.phone);
    }

    if(!thisCart.testEmail(thisCart.dom.address)){
      thisCart.markFieldError(thisCart.dom.address, true);
      errors.push('Wypełnij poprawnie adres email (np: jan@abc.pl)');
      console.log(thisCart.dom.address);
    }
    // console.log('errors2', errors);
    // console.log(errors.length);

    if(!errors.length){
      thisCart.sendOrder();
    } else {
      thisCart.dom.formMessage.innerHTML =
        `<h3 class="errors-title">Popraw błędy</h3>
        <ul class="errors-list">
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>`;
    }
  }
}

export default Cart;


