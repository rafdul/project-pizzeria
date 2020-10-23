/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);
    }

    // renderInMenu odpowiada za pojawienie się produktów na stronie (odwołuje się do data.js)
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

    // getElements służy odnalezieniu elementów HTML w kontenerze produktu
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

      console.log('formInputs',thisProduct.formInputs);
      console.log('priceElement', thisProduct.priceElem);
    }

    // initAccordion pozwala wyświetlać składniki tylko jednego produktu (resztę zwija)
    initAccordion(){
      const thisProduct = this;
      // console.log('this 1', this);

      /* find the clickable trigger (the element that should react to clicking) */
      const trigger = thisProduct.accordionTrigger;

      /* START: click event listener to trigger */
      trigger.addEventListener('click', function (event){
        console.log('clicked - listener in accordion');

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

    // initOrderForm dodaje listenery eventów do formularza, jego kontrolek, oraz guzika dodania do koszyka
    // uruchamiana tylko raz dla każdego produktu
    initOrderForm(){
      const thisProduct = this;
      console.log('initOrderForm');

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
      });

    }

    // processOrder to metoda obliczająca cenę produktu
    processOrder(){
      const thisProduct = this;
      console.log('processOrder');

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

      let price = thisProduct.data.price;
      console.log('price', price);

      //LOOP 1 stworzymy pętlę, która iteruje po wszystkich elementach params
      for (let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        console.log('params', thisProduct.data.params);
        console.log('paramId',paramId);

        // LOOP 2 iterująca po wszystkich opcjach danego parametru
        for (let optionId in param.options){
          console.log('options', param.options);
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
          // END LOOP 2
        }
      // END LOOP 1
      }

      thisProduct.priceElem.innerHTML = price;
      console.log('end price', price);
    }
  }

  // deklaracja wykorzystywanych metod dla zmiennej app czyli obiektu, który pomoże w organizacji kodu aplikacji,
  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data); // .data to odesłanie do pliku data.js
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony.
  app.init();
}
