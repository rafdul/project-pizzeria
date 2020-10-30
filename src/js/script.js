/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      // console.log('new Product:', thisProduct);
    }

    // metoda renderInMenu odpowiada za pojawienie się produktów na stronie (odwołuje się do data.js)
    renderInMenu(){
      const thisProduct = this;

      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /*create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);

      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }

    // metoda getElements służy odnalezieniu elementów HTML w kontenerze produktu
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

      // console.log('formInputs',thisProduct.formInputs);
      // console.log('priceElement', amountWidgetElem);
      // console.log('imageWrapper',thisProduct.imageWrapper);
    }

    // metoda initAccordion pozwala wyświetlać składniki tylko jednego produktu (resztę zwija)
    initAccordion(){
      const thisProduct = this;
      // console.log('this 1', this);

      /* find the clickable trigger (the element that should react to clicking) */
      const trigger = thisProduct.accordionTrigger;

      /* START: click event listener to trigger */
      trigger.addEventListener('click', function (event){
        // console.log('clicked - listener in accordion');

        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

        /* find all active products */
        const activeProducts = document.querySelectorAll('.product.active');

        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts){

          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element){

            /* remove class active for the active product */
            activeProduct.classList.remove('active');
            // console.log('this 2', this);

          /* END: if the active product isn't the element of thisProduct */
          }
        /* END LOOP: for each active product */
        }
      /* END: click event listener to trigger */
      });
    }

    // initOrderForm dodaje listenery eventów do formularza, jego kontrolek,
    // oraz guzika dodania do koszyka; uruchamiana tylko raz dla każdego produktu
    initOrderForm(){
      const thisProduct = this;
      // console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    // processOrder to metoda obliczająca cenę produktu
    processOrder(){
      const thisProduct = this;
      // console.log('processOrder');

      // remove class active from images
      const classImages = thisProduct.imageWrapper.querySelectorAll('img');
      for(let classImage of classImages){
        if (classImage.classList.lenght >=2){
          classImage.classList.remove(classNames.menuProduct.imageVisible);
        }
      }

      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData', formData);

      thisProduct.params = {};
      // set variable price to equal thisProduct.data.price
      let price = thisProduct.data.price;
      // console.log('price', price);

      //LOOP 1 stworzymy pętlę, która iteruje po wszystkich elementach params
      for (let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        // console.log('params', thisProduct.data.params);
        // console.log('paramId',paramId);

        // LOOP 2 iterująca po wszystkich opcjach danego parametru
        for (let optionId in param.options){
          // console.log('options', param.options);
          const option = param.options[optionId];
          // console.log('optionId', optionId);

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          // jeśli jest zaznaczona opcja, która nie jest domyślna, cena produktu musi się zwiększyć o cenę tej opcji,
          if(optionSelected && !option.default){
            price += option.price;
          // jeśli nie jest zaznaczona opcja, która jest domyślna, cena produktu musi się zmniejszyć o cenę tej opcji.
          } else if(!optionSelected && option.default){
            price -= option.price;
          }

          // Modyfikacja obrazków obok produktów
          // stworzenie stałej, w której zapiszesz wyszukane elementy,
          const visibleImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
          // console.log('visibleImages',visibleImages);

          for (let image of visibleImages) {
            if(optionSelected){
              if(!thisProduct.params[paramId]){
                thisProduct.params[paramId] = {
                  label: param.label,
                  options: {},
                };
              }
              thisProduct.params[paramId].options[optionId] = option.label;
              image.classList.add(classNames.menuProduct.imageVisible);
              // console.log('active image', image);
            } else {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          // Sposób opisany w skrypcie
          // // blok if/else, którego warunek sprawdza tylko, czy opcja została zaznaczona,
          // if (optionSelected){
          //   // wewnątrz bloku if musi znaleźć się pętla iterująca po znalezionych elementach
          //   for (let image of visibleImages) {
          //     image.classList.add(classNames.menuProduct.imageVisible);
          //     console.log('active image', image);
          //     // dodać odpowiednią klasę
          //   }
          // } else {
          //   // wewnątrz bloku else musi znaleźć się pętla iterująca po znalezionych elementach
          //   for (let image of visibleImages) {
          //   // usunąć odpowiednią klasę
          //     image.classList.remove(classNames.menuProduct.imageVisible);
          //   }
          // }
          // END LOOP 2
        }
      // END LOOP 1
      }
      // multiply price by amount
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      //  set the contents of thisProduct.priceElem to be the value of variable price
      thisProduct.priceElem.innerHTML = thisProduct.price;
      // console.log('end price', price);
      // console.log('thisProduct.params',thisProduct.params);
    }

    // initAmountWidget tworzy instancję klasy AmountWidget i zapisywała ją we właściwości produktu
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      // nasłuchiwanie eventu ('updated') stworzonego w metodzie announce i uruchamianie
      // metody processOrder, obliczającej cenę produktu
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    // metoda dodawania produktu do koszyka
    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value ;

      app.cart.add(thisProduct);
      // console.log(thisProduct);
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      // thisWidget.element.setAttribute('data-min', settings.amountWidget.defaultMin);
      // thisWidget.element.setAttribute('data-max', settings.amountWidget.defaultMax);
      // thisWidget.setValue(settings.amountWidget.defaultValue); //to rozwiązanie uniemożliwia poprawne działanie initAmountWidget w CartProduct
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      // console.log('AmountWidget:', thisWidget);
      // console.log('construkctor arguments:', element);

      // console.log(thisWidget.element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    // metoda ustawiająca nową wartość widgetu
    setValue(value){
      const thisWidget = this;
      // thisWidget.limitAmount();

      const newValue = parseInt(value);

      // const minLimit = thisWidget.element.getAttribute('data-min');
      // const maxLimit = thisWidget.element.getAttribute('data-max');
      // console.log(minLimit);
      // console.log(maxLimit);

      if(newValue !== thisWidget.input.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      // if(newValue !== thisWidget.input.value && newValue >= minLimit && newValue <= maxLimit) {
        thisWidget.value = newValue;

        thisWidget.announce();
        // console.log(minLimit);
      }

      thisWidget.input.value = thisWidget.value;

      // inna metoda określenia limitów min i max dla wartości w widgecie
      // 1. w konstruktorze amountWidget dodaję do thisWidget.element nowe atrybuty data-min i data-max
      // 2. w metodzie setValue tworzę zmienne minLimit i maxLimit pobierające wartości tych atrybutów
      // 3. w warunku if wykorzystuje te dwie zmienne do określenia min i max dla wartości widgeta

    }

    // metoda aktywujące buttony + i - w widgecie
    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
        // console.log(event);
        // console.log(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
        // thisWidget.setValue(thisWidget.value -= 1 && thisWidget.value > settings.amountWidget.defaultMin);
        // console.log(event);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
        // thisWidget.setValue(thisWidget.value += 1 && thisWidget.value < settings.amountWidget.defaultMax);
      });
    }

    // metoda wywołująca customowy event wskazujący na konieczność zaktualizowania ceny produktu
    // metoda tworzy instancję klasy Event, wbudowanej w silnik JS (tj. w przeglądarkę)
    // następnie, ten event zostanie wywołany na kontenerze naszego widgetu.
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

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
      })
    }

    // metoda usuwająca produkt z koszyka
    remove(cartProduct){
      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }

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
        address: 'test',
        totalPrice: thisCart.totalPrice,
      };

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
    }
  }

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
  }

  // deklaracja wykorzystywanych metod dla zmiennej app czyli obiektu,
  // który pomoże w organizacji kodu aplikacji,
  const app = {
    initMenu: function(){
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data); // .data to odesłanie do pliku data.js
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      // wywołanie zapytania AJAX
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          // save parsedResponse as thisApp.data.products
          thisApp.data.products = parsedResponse;

          // execute initMenu method
          /* metodę initMenu trzeba było przenieść do tego miejsca z samego końca, */
          /*  ponieważ w związku z asynchronicznością AJAX uruchamiałaby się */
          /*  zanim skrypt otrzymałby z serwera listę produktów */
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    // metoda inicjująca instację koszyka; przekazujemy jej wraper koszyka
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      // thisApp.initMenu();
      thisApp.initCart();
    },
  };

  // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony.
  app.init();
}
